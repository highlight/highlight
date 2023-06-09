package errorgroups

import (
	"strings"

	"github.com/highlight-run/highlight/backend/model"
	privateModel "github.com/highlight-run/highlight/backend/private-graph/graph/model"
	"github.com/samber/lo"
)

func IsErrorTraceFiltered(project model.Project, structuredStackTrace []*privateModel.ErrorTrace) bool {
	hasChromeExtensionFrame := lo.SomeBy(structuredStackTrace, func(frame *privateModel.ErrorTrace) bool {
		return IsFrameChromeExtension(*frame)
	})

	return hasChromeExtensionFrame
}

func IsFrameChromeExtension(frame privateModel.ErrorTrace) bool {
	return frame.FileName != nil && strings.HasPrefix(*frame.FileName, "chrome-extension")
}
