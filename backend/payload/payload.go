package payload

import (
	"bufio"
	"encoding/json"
	"fmt"
	"io"
	"os"
	"strings"

	"github.com/andybalholm/brotli"
	"github.com/highlight-run/highlight/backend/hlog"
	"github.com/highlight-run/highlight/backend/model"
	"github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
)

var Delimiter = "\n\n\n"

type PayloadReadWriter struct {
	file   *os.File
	Length int64
}

func NewPayloadReadWriter(file *os.File) *PayloadReadWriter {
	p := &PayloadReadWriter{file: file}
	return p
}

func (p *PayloadReadWriter) Reader() *ObjectReader {
	return NewObjectReader(p.file)
}

func (p *PayloadReadWriter) Writer() *ObjectWriter {
	return NewObjectWriter(p.file)
}

type ObjectReader struct {
	reader *bufio.Reader
}

func NewObjectReader(file *os.File) *ObjectReader {
	return &ObjectReader{reader: bufio.NewReader(file)}
}

// {resources: []}
// {events: []}
// {messages: []}
func (o *ObjectReader) Next() (linePtr *string, e error) {
	// Keep reading until the end of the line has the delimitter.
	line := ""
	linePtr = &line
	for {
		strBytes, err := o.reader.ReadBytes('\n')
		str := string(strBytes)
		if err != nil {
			if errors.Is(err, io.EOF) {
				line += str
				e = err
				break
			}
			return nil, errors.Wrap(err, "error reading line from bufio reader")
		}
		line += str
		if strings.HasSuffix(line, Delimiter) {
			break
		}
	}
	return linePtr, e
}

type ObjectWriter struct {
	writer *bufio.Writer
}

func NewObjectWriter(file *os.File) *ObjectWriter {
	return &ObjectWriter{writer: bufio.NewWriter(file)}
}

func (o *ObjectWriter) Write(m model.Object) error {
	if _, err := o.writer.WriteString(m.Contents()); err != nil {
		return errors.Wrap(err, "error writing payload to file")
	}
	if _, err := o.writer.WriteString(Delimiter); err != nil {
		return errors.Wrap(err, "error writing message delimiter")
	}
	o.writer.Flush()
	return nil
}

type CompressedJSONArrayWriter struct {
	writer      *brotli.Writer
	hasContents bool
}

const BROTLI_COMPRESSION_LEVEL = 9

// Initializes a new writer with the configured compression level
func NewCompressedJSONArrayWriter(brFile *os.File) *CompressedJSONArrayWriter {
	brWriter := brotli.NewWriterLevel(brFile, BROTLI_COMPRESSION_LEVEL)
	return &CompressedJSONArrayWriter{
		writer:      (brWriter),
		hasContents: false,
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

type MessagesUnmarshalled struct {
	Messages []interface{}
}

func (m *MessagesUnmarshalled) getArray() []interface{} {
	return m.Messages
}

// Merges the inner contents of the input events objects into a large JSON array
func (w *CompressedJSONArrayWriter) WriteObject(events model.Object, unmarshalled Unmarshalled) error {
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
	if !w.hasContents {
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

	return nil
}

// Appends a closing bracket to close the JSON array, and closes the underlying writer
func (w *CompressedJSONArrayWriter) Close() error {
	if w.hasContents {
		if _, err := w.writer.Write([]byte("]")); err != nil {
			return errors.Wrap(err, "error writing message end")
		}
	} else {
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
	Events              *PayloadReadWriter
	Resources           *PayloadReadWriter
	Messages            *PayloadReadWriter
	EventsCompressed    *CompressedJSONArrayWriter
	ResourcesCompressed *CompressedJSONArrayWriter
	MessagesCompressed  *CompressedJSONArrayWriter
	EventsChunked       *CompressedJSONArrayWriter
	ChunkIndex          int
	files               map[FileType]*FileInfo
}

type FileType string

const (
	Events              FileType = "Events"
	Resources           FileType = "Resources"
	Messages            FileType = "Messages"
	EventsCompressed    FileType = "EventsCompressed"
	ResourcesCompressed FileType = "ResourcesCompressed"
	MessagesCompressed  FileType = "MessagesCompressed"
	EventsChunked       FileType = "EventsChunked"
)

type FileInfo struct {
	close  func()
	file   *os.File
	suffix string
	ddTag  string
}

func createFile(name string) (func(), *os.File, error) {
	file, err := os.Create(name)
	if err != nil {
		return nil, nil, errors.Wrap(err, "error creating file")
	}
	return func() {
		err := file.Close()
		if err != nil {
			log.Error(errors.Wrap(err, "failed to close file"))
			return
		}
		err = os.Remove(file.Name())
		if err != nil {
			log.Error(errors.Wrap(err, "failed to remove file"))
			return
		}
	}, file, nil
}

func NewPayloadManager(filenamePrefix string) (*PayloadManager, error) {
	files := map[FileType]*FileInfo{
		Events: {
			suffix: ".events.txt",
			ddTag:  "eventPayloadSize",
		},
		Resources: {
			suffix: ".resources.txt",
			ddTag:  "resourcePayloadSize",
		},
		Messages: {
			suffix: ".messages.txt",
			ddTag:  "messagePayloadSize",
		},
		EventsCompressed: {
			suffix: ".events.json.br",
			ddTag:  "eventsCompressedPayloadSize",
		},
		ResourcesCompressed: {
			suffix: ".resources.json.br",
			ddTag:  "resourcesCompressedPayloadSize",
		},
		MessagesCompressed: {
			suffix: ".messages.json.br",
			ddTag:  "messagesCompressedPayloadSize",
		},
	}

	manager := &PayloadManager{
		files: files,
	}

	for fileType, fileInfo := range files {
		close, file, err := createFile(filenamePrefix + fileInfo.suffix)
		if err != nil {
			manager.Close()
			return nil, errors.Wrapf(err, "error creating %s file", string(fileType))
		}
		fileInfo.file = file
		fileInfo.close = close

		switch fileType {
		case Events:
			manager.Events = NewPayloadReadWriter(fileInfo.file)
		case Resources:
			manager.Resources = NewPayloadReadWriter(fileInfo.file)
		case Messages:
			manager.Messages = NewPayloadReadWriter(fileInfo.file)
		case EventsCompressed:
			manager.EventsCompressed = NewCompressedJSONArrayWriter(fileInfo.file)
		case ResourcesCompressed:
			manager.ResourcesCompressed = NewCompressedJSONArrayWriter(fileInfo.file)
		case MessagesCompressed:
			manager.MessagesCompressed = NewCompressedJSONArrayWriter(fileInfo.file)
		}
	}

	manager.ChunkIndex = -1
	files[EventsChunked] = &FileInfo{
		ddTag: "EventsChunked",
		close: func() {},
	}

	return manager, nil
}

func (pm *PayloadManager) NewChunkedFile(filenamePrefix string) error {
	fileInfo := pm.files[EventsChunked]
	fileInfo.close()

	pm.ChunkIndex += 1
	suffix := fmt.Sprintf(".eventschunked%04d.json.br", pm.ChunkIndex)
	fileInfo.suffix = suffix
	close, file, err := createFile(filenamePrefix + suffix)

	if err != nil {
		return errors.Wrapf(err, "error creating new EventsChunked file")
	}
	fileInfo.file = file
	fileInfo.close = close

	pm.EventsChunked = NewCompressedJSONArrayWriter(fileInfo.file)
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
		hlog.Histogram(fmt.Sprintf("worker.processSession.%s", fileInfo.ddTag), float64(eventInfo.Size()), nil, 1) //nolint
	}
	return nil
}

func (pm *PayloadManager) GetFile(fileType FileType) *os.File {
	return pm.files[fileType].file
}

// Reset file pointers to beginning of file for reading
func (pm *PayloadManager) SeekStart() {
	for _, fileInfo := range pm.files {
		file := fileInfo.file
		if file == nil {
			continue
		}
		if _, err := file.Seek(0, io.SeekStart); err != nil {
			log.WithField("file_name", file.Name()).Errorf("error seeking to beginning of file: %v", err)
		}
	}
}
