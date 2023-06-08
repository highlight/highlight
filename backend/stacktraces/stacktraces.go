package stacktraces

import (
	"context"
	"encoding/json"
	"regexp"
	"strconv"
	"strings"

	publicModel "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/openlyinc/pointy"
	log "github.com/sirupsen/logrus"
)

func StructureStackTrace(stackTrace string) ([]*publicModel.ErrorTrace, error) {
	jsPattern := regexp.MustCompile(` {4}at ((.+) )?\(?(.+):(\d+):(\d+)\)?`)
	jsAnonPattern := regexp.MustCompile(` {4}at (.+) \((.+)\)`)
	pyPattern := regexp.MustCompile(` {2}File "(.+)", line (\d+), in (\w+)`)
	pyExcPattern := regexp.MustCompile(`^(\S.+)`)
	pyUnderPattern := regexp.MustCompile(`^\s*[\^~]+\s*$`)
	pyMultiPattern := regexp.MustCompile(`^During handling of the above exception, another exception occurred:$`)
	goLinePattern := regexp.MustCompile(`\t(.+):(\d+)( 0x[0-f]+)?`)
	goFuncPattern := regexp.MustCompile(`^(.+)\.(.+?)(\([^()]*\))?$`)
	generalPattern := regexp.MustCompile(`^(.+)`)

	var language string
	var errMsg string
	var frames []*publicModel.ErrorTrace
	var frame *publicModel.ErrorTrace
	var jsonStr string
	if err := json.Unmarshal([]byte(stackTrace), &jsonStr); err == nil {
		stackTrace = jsonStr
	}
	lines := strings.Split(stackTrace, "\n")
	for idx, line := range lines {
		if line == "Traceback (most recent call last):" {
			language = "python"
			continue
		}
		if idx == 0 {
			if line == "" {
				language = "golang"
				continue
			}
			errMsg = line
			continue
		}
		if line == "" {
			continue
		}
		if language == "python" && idx == len(lines)-2 {
			errMsg = line
			continue
		}
		if matches := pyUnderPattern.FindSubmatch([]byte(line)); language == "python" && matches != nil {
			continue
		}
		if matches := pyMultiPattern.FindSubmatch([]byte(line)); language == "python" && matches != nil {
			continue
		}
		if errMsg == "" {
			errMsg = line
		}
		if frame == nil {
			frame = &publicModel.ErrorTrace{
				Error: &errMsg,
			}
		}
		if matches := jsPattern.FindSubmatch([]byte(line)); matches != nil {
			language = "js"
			if matches[2] != nil {
				frame.FunctionName = pointy.String(string(matches[2]))
			}
			frame.FileName = pointy.String(string(matches[3]))
			l, _ := strconv.ParseInt(string(matches[4]), 10, 32)
			col, _ := strconv.ParseInt(string(matches[5]), 10, 32)
			frame.LineNumber = pointy.Int(int(l))
			frame.ColumnNumber = pointy.Int(int(col))
		} else if matches := jsAnonPattern.FindSubmatch([]byte(line)); matches != nil {
			language = "js"
			frame.FunctionName = pointy.String(string(matches[1]))
			frame.FileName = pointy.String(string(matches[2]))
			frame.LineContent = pointy.String(string(matches[2]))
		} else if matches := pyPattern.FindSubmatch([]byte(line)); matches != nil {
			language = "python"
			frame.FunctionName = pointy.String(string(matches[3]))
			frame.FileName = pointy.String(string(matches[1]))
			line, _ := strconv.ParseInt(string(matches[2]), 10, 32)
			frame.LineNumber = pointy.Int(int(line))
			continue
		} else if matches := goLinePattern.FindSubmatch([]byte(line)); matches != nil {
			language = "golang"
			frame.FileName = pointy.String(string(matches[1]))
			line, _ := strconv.ParseInt(string(matches[2]), 10, 32)
			frame.LineNumber = pointy.Int(int(line))
		} else if matches := goFuncPattern.FindSubmatch([]byte(line)); language == "golang" && matches != nil {
			frame.FunctionName = pointy.String(string(matches[2]))
			continue
		} else if matches := generalPattern.FindSubmatch([]byte(line)); matches != nil {
			if language == "golang" {
				frame.FunctionName = pointy.String(string(matches[1]))
				continue
			} else if language == "python" {
				if m := pyExcPattern.FindSubmatch([]byte(line)); m != nil {
					errMsg = line
					continue
				}
			} else {
				if frame.LineContent == nil {
					frame.LineContent = pointy.String(string(matches[1]))
				}
			}
		}
		frames = append(frames, frame)
		frame = nil
	}
	return frames, nil
}

func FormatStructureStackTrace(ctx context.Context, stackTrace string) string {
	frames, err := StructureStackTrace(stackTrace)
	if err != nil {
		log.WithContext(ctx).WithField("StackTrace", stackTrace).WithError(err).Warnf("otel failed to structure stacktrace")
		return stackTrace
	}
	output, err := json.Marshal(frames)
	if err != nil {
		log.WithContext(ctx).WithField("Frames", frames).WithField("StackTrace", stackTrace).WithError(err).Warnf("otel failed to json stringify frames")
		return stackTrace
	}
	return string(output)
}
