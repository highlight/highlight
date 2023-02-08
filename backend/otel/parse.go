package otel

import (
	"encoding/json"
	model3 "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/openlyinc/pointy"
	log "github.com/sirupsen/logrus"
	"regexp"
	"strconv"
	"strings"
)

func structureStackTrace(stackTrace string) ([]*model3.ErrorTrace, error) {
	var language string
	var errMsg string
	var frames []*model3.ErrorTrace
	var frame *model3.ErrorTrace
	lines := strings.Split(stackTrace, "\n")
	for idx, line := range lines {
		if idx == 0 {
			if line == "" {
				language = "golang"
				continue
			} else if line == "Traceback (most recent call last):" {
				language = "python"
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
		if frame == nil {
			frame = &model3.ErrorTrace{
				Error: &errMsg,
			}
		}
		jsPattern := regexp.MustCompile(` {4}at ((.+) )?\(?(.+):(\d+):(\d+)\)?`)
		jsAnonPattern := regexp.MustCompile(` {4}at (.+) \((.+)\)`)
		pyPattern := regexp.MustCompile(` {2}File "(.+)", line (\d+), in (\w+)`)
		goLinePattern := regexp.MustCompile(`\t(.+):(\d+)`)
		generalPattern := regexp.MustCompile(`^(.+)`)
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
		} else if matches := generalPattern.FindSubmatch([]byte(line)); matches != nil {
			frame.FunctionName = pointy.String(string(matches[1]))
			if language == "golang" {
				continue
			}
		}
		frames = append(frames, frame)
		frame = nil
	}
	return frames, nil
}

func formatStructureStackTrace(stackTrace string) string {
	frames, err := structureStackTrace(stackTrace)
	if err != nil {
		log.WithField("StackTrace", stackTrace).WithError(err).Warnf("otel failed to structure stacktrace")
		return stackTrace
	}
	output, err := json.Marshal(frames)
	if err != nil {
		log.WithField("Frames", frames).WithField("StackTrace", stackTrace).WithError(err).Warnf("otel failed to json stringify frames")
		return stackTrace
	}
	return string(output)
}
