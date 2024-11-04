package stacktraces

import (
	"context"
	"encoding/json"
	"regexp"
	"strconv"
	"strings"

	"github.com/openlyinc/pointy"
	log "github.com/sirupsen/logrus"

	publicModel "github.com/highlight-run/highlight/backend/private-graph/graph/model"
)

type Language string

const JavascriptOTeL Language = "js-otel"
const Javascript Language = "js"
const Python Language = "python"
const Golang Language = "golang"
const DotNET Language = "dotnet"
const Ruby Language = "ruby"

var (
	jsPattern               = regexp.MustCompile(` {4}at ((.+) )?\(?(.+):(\d+):(\d+)\)?`)
	jsAnonPattern           = regexp.MustCompile(` {4}at (.+) \((.+)\)`)
	jsOTeLPattern           = regexp.MustCompile(`(.*)@(.+\.js):(\d+):(\d+)`)
	pyPattern               = regexp.MustCompile(` {2}File "(.+)", line (\d+), in (\w+)`)
	pyExcPattern            = regexp.MustCompile(`^(\S.+)`)
	pyUnderPattern          = regexp.MustCompile(`^\s*[\^~]+\s*$`)
	pyMultiPattern          = regexp.MustCompile(`^During handling of the above exception, another exception occurred:$`)
	rubyPattern             = regexp.MustCompile(`\tfrom (.+):(\d+)( 0x[0-f]+)?`)
	goLinePattern           = regexp.MustCompile(`\t(.+):(\d+)( 0x[0-f]+)?`)
	goFuncPattern           = regexp.MustCompile(`^(.+)\.(.+?)(\([^()]*\))?$`)
	goRecoveredPanicPattern = regexp.MustCompile(`^\s*runtime\.gopanic\s*$`)
	dotnetCSPattern         = regexp.MustCompile(`\.cs`)
	dotnetExceptionPattern  = regexp.MustCompile(`^([\w.]+: .+?)( at .+)?$`)
	dotnetFilePattern       = regexp.MustCompile(`^\s*at (.+?)(?: in (.+?)(?::line (\d+))?)?$`)
	generalPattern          = regexp.MustCompile(`^(.+)`)
)

// StructureOTELStackTrace processes a backend opentelemetry stacktrace into a structured ErrorTraces.
// The operation returns the deepest frame first (reversing the order of the incoming stacktrace).
func StructureOTELStackTrace(stackTrace string, opts ...StructureStackTraceOption) ([]*publicModel.ErrorTrace, error) {
	var cfg StructureStackTraceConfig
	for _, opt := range opts {
		opt(&cfg)
	}

	var jsonStr string
	if err := json.Unmarshal([]byte(stackTrace), &jsonStr); err == nil {
		stackTrace = jsonStr
	}
	var language Language
	if m := dotnetCSPattern.Find([]byte(stackTrace)); m != nil {
		language = DotNET
	}

	var errMsg string
	var frame *publicModel.ErrorTrace
	frames := []*publicModel.ErrorTrace{}
	lines := strings.Split(stackTrace, "\n")
	for idx := 0; idx < len(lines); idx++ {
		line := lines[idx]
		// frames explicitly set to nil means that this is part of a frame that is resetting the stacktrace
		if frames == nil {
			frames = []*publicModel.ErrorTrace{}
			continue
		}
		if line == "Traceback (most recent call last):" {
			language = Python
			continue
		}
		if idx == 0 {
			if line == "" {
				language = Golang
				continue
			} else if matches := dotnetExceptionPattern.FindSubmatch([]byte(line)); language == DotNET && matches != nil {
				errMsg = string(matches[1])
				if m := strings.Split(strings.ReplaceAll(string(matches[2]), " at ", "\n at "), "\n"); m != nil {
					lines = append(lines, m...)
				}
				continue
			} else if matches := jsOTeLPattern.FindSubmatch([]byte(line)); matches != nil {
				language = JavascriptOTeL
			}
			if language != JavascriptOTeL {
				errMsg = line
				continue
			}
		}
		if line == "" {
			continue
		}
		if language == Python && idx == len(lines)-2 {
			errMsg = line
			continue
		}
		if matches := pyUnderPattern.FindSubmatch([]byte(line)); language == Python && matches != nil {
			continue
		}
		if matches := pyMultiPattern.FindSubmatch([]byte(line)); language == Python && matches != nil {
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

		if matches := dotnetFilePattern.FindSubmatch([]byte(line)); language == DotNET && matches != nil {
			frame.FunctionName = pointy.String(string(matches[1]))
			frame.FileName = pointy.String(string(matches[2]))
			line, _ := strconv.ParseInt(string(matches[3]), 10, 32)
			frame.LineNumber = pointy.Int(int(line))
		} else if matches := jsPattern.FindSubmatch([]byte(line)); matches != nil {
			language = Javascript
			if cfg.FromOTeL {
				language = JavascriptOTeL
			}
			if matches[2] != nil {
				frame.FunctionName = pointy.String(string(matches[2]))
			}
			frame.FileName = pointy.String(string(matches[3]))
			l, _ := strconv.ParseInt(string(matches[4]), 10, 32)
			col, _ := strconv.ParseInt(string(matches[5]), 10, 32)
			frame.LineNumber = pointy.Int(int(l))
			frame.ColumnNumber = pointy.Int(int(col))
		} else if matches := jsAnonPattern.FindSubmatch([]byte(line)); matches != nil {
			language = Javascript
			if cfg.FromOTeL {
				language = JavascriptOTeL
			}
			frame.FunctionName = pointy.String(string(matches[1]))
			frame.FileName = pointy.String(string(matches[2]))
			frame.LineContent = pointy.String(string(matches[2]))
		} else if matches := jsOTeLPattern.FindSubmatch([]byte(line)); matches != nil {
			language = JavascriptOTeL
			frame.FunctionName = pointy.String(string(matches[1]))
			frame.FileName = pointy.String(string(matches[2]))
			l, _ := strconv.ParseInt(string(matches[3]), 10, 32)
			col, _ := strconv.ParseInt(string(matches[4]), 10, 32)
			frame.LineNumber = pointy.Int(int(l))
			frame.ColumnNumber = pointy.Int(int(col))
		} else if matches := pyPattern.FindSubmatch([]byte(line)); matches != nil {
			language = Python
			frame.FunctionName = pointy.String(string(matches[3]))
			frame.FileName = pointy.String(string(matches[1]))
			line, _ := strconv.ParseInt(string(matches[2]), 10, 32)
			frame.LineNumber = pointy.Int(int(line))
			continue
		} else if matches := rubyPattern.FindSubmatch([]byte(line)); matches != nil {
			language = Ruby
			frame.FileName = pointy.String(string(matches[1]))
			line, _ := strconv.ParseInt(string(matches[2]), 10, 32)
			frame.LineNumber = pointy.Int(int(line))
		} else if matches := goRecoveredPanicPattern.FindSubmatch([]byte(line)); matches != nil {
			language = Golang
			frames = nil
			frame = nil
			errMsg = ""
			continue
		} else if matches := goLinePattern.FindSubmatch([]byte(line)); matches != nil {
			language = Golang
			frame.FileName = pointy.String(string(matches[1]))
			line, _ := strconv.ParseInt(string(matches[2]), 10, 32)
			frame.LineNumber = pointy.Int(int(line))
		} else if matches := goFuncPattern.FindSubmatch([]byte(line)); language == Golang && matches != nil {
			frame.FunctionName = pointy.String(string(matches[2]))
			continue
		} else if matches := generalPattern.FindSubmatch([]byte(line)); matches != nil {
			if language == Golang {
				frame.FunctionName = pointy.String(string(matches[1]))
				continue
			} else if language == Python {
				if m := pyExcPattern.FindSubmatch([]byte(line)); m != nil {
					errMsg = line
					continue
				}
			}
			frame.LineContent = pointy.String(string(matches[1]))
		}
		frames = append(frames, frame)
		frame = nil
	}
	// for some non-otel-native errors, stacktraces are sent top-down (top frame is most outer; bottom frame is most inner)
	// our backend expects to store stack traces in the opposite order, so we have to reverse it before returning.
	if language != JavascriptOTeL && language != Golang && language != DotNET && language != Ruby {
		for i, j := 0, len(frames)-1; i < j; i, j = i+1, j-1 {
			frames[i], frames[j] = frames[j], frames[i]
		}
	}
	return frames, nil
}

func FormatStructureStackTrace(ctx context.Context, stackTrace string, opts ...StructureStackTraceOption) string {
	frames, err := StructureOTELStackTrace(stackTrace, opts...)
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

type StructureStackTraceConfig struct {
	FromOTeL bool
}

type StructureStackTraceOption func(cfg *StructureStackTraceConfig)

func FromOTeL() StructureStackTraceOption {
	return func(cfg *StructureStackTraceConfig) {
		cfg.FromOTeL = true
	}
}
