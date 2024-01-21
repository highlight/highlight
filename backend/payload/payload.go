package payload

import (
	"context"
	"fmt"
	"io"
	"os"

	"github.com/andybalholm/brotli"
	"github.com/highlight-run/highlight/backend/model"
	hmetric "github.com/highlight/highlight/sdk/highlight-go/metric"
	"github.com/pkg/errors"
	"github.com/segmentio/encoding/json"
	log "github.com/sirupsen/logrus"
)

type CompressedWriter struct {
	writer           *brotli.Writer
	hasContents      bool
	hasUnclosedArray bool
}

const BROTLI_COMPRESSION_LEVEL = 5

// Initializes a new writer with the configured compression level
func NewCompressedWriter(brFile *os.File) *CompressedWriter {
	brWriter := brotli.NewWriterLevel(brFile, BROTLI_COMPRESSION_LEVEL)
	return &CompressedWriter{
		writer:           brWriter,
		hasContents:      false,
		hasUnclosedArray: false,
	}
}

type Unmarshalled interface {
	getArray() []interface{}
}

type EventsUnmarshalled struct {
	Events []interface{}
}

func (e *EventsUnmarshalled) getArray() []interface{} {
	return e.Events
}

type ResourcesUnmarshalled struct {
	Resources []interface{}
}

func (r *ResourcesUnmarshalled) getArray() []interface{} {
	return r.Resources
}

type WebSocketEventsUnmarshalled struct {
	WebSocketEvents []interface{}
}

func (r *WebSocketEventsUnmarshalled) getArray() []interface{} {
	return r.WebSocketEvents
}

type MessagesUnmarshalled struct {
	Messages []interface{}
}

func (m *MessagesUnmarshalled) getArray() []interface{} {
	return m.Messages
}

// Merges the inner contents of the input events objects into a large JSON array
func (w *CompressedWriter) WriteObject(events model.Object, unmarshalled Unmarshalled) error {
	// EventsObject.Events is a string with the format "{events:[{...},{...},...]}"
	// Unmarshal this string, then marshal the inner array
	if err := json.Unmarshal([]byte(events.Contents()), unmarshalled); err != nil {
		return errors.Wrap(err, "error unmarshalling events")
	}
	if len(unmarshalled.getArray()) == 0 {
		return nil
	}
	remarshalled, err := json.Marshal(unmarshalled.getArray())
	if err != nil {
		return errors.Wrap(err, "error marshalling events array")
	}

	// If nothing has been written yet, start with an opening bracket
	if !w.hasUnclosedArray {
		if _, err := w.writer.Write([]byte("[")); err != nil {
			return errors.Wrap(err, "error writing message start")
		}
	} else {
		if _, err := w.writer.Write([]byte(",")); err != nil {
			return errors.Wrap(err, "error writing message delimiter")
		}
	}

	// Strip the start and end brackets from the array string
	if _, err := w.writer.Write(remarshalled[1 : len(remarshalled)-1]); err != nil {
		return errors.Wrap(err, "error writing compressed payload to file")
	}

	w.hasContents = true
	w.hasUnclosedArray = true

	return nil
}

func (w *CompressedWriter) WriteString(data string) error {
	if _, err := w.writer.Write([]byte(data)); err != nil {
		return errors.Wrap(err, "error writing compressed string to file")
	}

	w.hasContents = true
	w.hasUnclosedArray = false

	return nil
}

// Appends a closing bracket to close the JSON array, and closes the underlying writer
func (w *CompressedWriter) Close() error {
	if w.hasUnclosedArray {
		if _, err := w.writer.Write([]byte("]")); err != nil {
			return errors.Wrap(err, "error writing message end")
		}
	} else if !w.hasContents {
		if _, err := w.writer.Write([]byte("[]")); err != nil {
			return errors.Wrap(err, "error writing empty message")
		}
	}
	if err := w.writer.Close(); err != nil {
		return errors.Wrap(err, "error closing writer")
	}
	return nil
}

type PayloadManager struct {
	EventsCompressed          *CompressedWriter
	ResourcesCompressed       *CompressedWriter
	WebSocketEventsCompressed *CompressedWriter
	EventsChunked             *CompressedWriter
	TimelineIndicatorEvents   *CompressedWriter
	ChunkIndex                int
	files                     map[FileType]*FileInfo
}

type FileType string

const (
	EventsCompressed          FileType = "EventsCompressed"
	ResourcesCompressed       FileType = "ResourcesCompressed"
	WebSocketEventsCompressed FileType = "WebSocketEventsCompressed"
	EventsChunked             FileType = "EventsChunked"
	TimelineIndicatorEvents   FileType = "TimelineIndicatorEvents"
)

type FileInfo struct {
	close  func()
	file   *os.File
	suffix string
	ddTag  string
}

func createFile(ctx context.Context, name string) (func(), *os.File, error) {
	file, err := os.Create(name)
	if err != nil {
		return nil, nil, errors.Wrap(err, "error creating file")
	}
	return func() {
		err := file.Close()
		if err != nil {
			log.WithContext(ctx).Error(errors.Wrap(err, "failed to close file"))
			return
		}
		err = os.Remove(file.Name())
		if err != nil {
			log.WithContext(ctx).Error(errors.Wrap(err, "failed to remove file"))
			return
		}
	}, file, nil
}

func NewPayloadManager(ctx context.Context, filenamePrefix string) (*PayloadManager, error) {
	files := map[FileType]*FileInfo{
		EventsCompressed: {
			suffix: ".events.json.br",
			ddTag:  "eventsCompressedPayloadSize",
		},
		ResourcesCompressed: {
			suffix: ".resources.json.br",
			ddTag:  "resourcesCompressedPayloadSize",
		},
		WebSocketEventsCompressed: {
			suffix: ".websocketevents.json.br",
			ddTag:  "webSocketEventsCompressedPayloadSize",
		},
		TimelineIndicatorEvents: {
			suffix: ".timelineindicatorevents.json.br",
			ddTag:  "timelineIndicatorEventsPayloadSize",
		},
	}

	manager := &PayloadManager{
		files: files,
	}

	for fileType, fileInfo := range files {
		close, file, err := createFile(ctx, filenamePrefix+fileInfo.suffix)
		if err != nil {
			manager.Close()
			return nil, errors.Wrapf(err, "error creating %s file", string(fileType))
		}
		fileInfo.file = file
		fileInfo.close = close

		switch fileType {
		case EventsCompressed:
			manager.EventsCompressed = NewCompressedWriter(fileInfo.file)
		case ResourcesCompressed:
			manager.ResourcesCompressed = NewCompressedWriter(fileInfo.file)
		case WebSocketEventsCompressed:
			manager.WebSocketEventsCompressed = NewCompressedWriter(fileInfo.file)
		case TimelineIndicatorEvents:
			manager.TimelineIndicatorEvents = NewCompressedWriter(fileInfo.file)
		}
	}

	manager.ChunkIndex = -1
	files[EventsChunked] = &FileInfo{
		ddTag: "EventsChunked",
		close: func() {},
	}

	return manager, nil
}

func (pm *PayloadManager) NewChunkedFile(ctx context.Context, filenamePrefix string) error {
	fileInfo := pm.files[EventsChunked]
	fileInfo.close()

	pm.ChunkIndex += 1
	suffix := fmt.Sprintf(".eventschunked%04d.json.br", pm.ChunkIndex)
	fileInfo.suffix = suffix
	close, file, err := createFile(ctx, filenamePrefix+suffix)

	if err != nil {
		return errors.Wrapf(err, "error creating new EventsChunked file")
	}
	fileInfo.file = file
	fileInfo.close = close

	pm.EventsChunked = NewCompressedWriter(fileInfo.file)
	return nil
}

func (pm *PayloadManager) Close() {
	for _, fileInfo := range pm.files {
		if fileInfo.close != nil {
			defer fileInfo.close()
		}
	}
}

func (pm *PayloadManager) ReportPayloadSizes() error {
	for _, fileInfo := range pm.files {
		if fileInfo.ddTag == "EventsChunked" {
			continue
		}
		eventInfo, err := fileInfo.file.Stat()
		if err != nil {
			return errors.Wrap(err, "error getting file info")
		}
		hmetric.Histogram(context.Background(), fmt.Sprintf("worker.processSession.%s", fileInfo.ddTag), float64(eventInfo.Size()), nil, 1) //nolint
	}
	return nil
}

func (pm *PayloadManager) GetFile(fileType FileType) *os.File {
	return pm.files[fileType].file
}

// Reset file pointers to beginning of file for reading
func (pm *PayloadManager) SeekStart(ctx context.Context) {
	for _, fileInfo := range pm.files {
		file := fileInfo.file
		if file == nil {
			continue
		}
		if _, err := file.Seek(0, io.SeekStart); err != nil {
			log.WithContext(ctx).WithField("file_name", file.Name()).Errorf("error seeking to beginning of file: %v", err)
		}
	}
}
