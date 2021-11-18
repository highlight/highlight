package payload

import (
	"bufio"
	"encoding/json"
	"io"
	"os"
	"strings"

	"github.com/andybalholm/brotli"
	"github.com/highlight-run/highlight/backend/model"
	"github.com/pkg/errors"
)

var Delimiter = "\n\n\n"

type PayloadReadWriter struct {
	File   *os.File
	Length int64
}

func NewPayloadReadWriter(file *os.File) *PayloadReadWriter {
	p := &PayloadReadWriter{File: file}
	return p
}

func (p *PayloadReadWriter) Reader() *ObjectReader {
	return NewObjectReader(p.File)
}

func (p *PayloadReadWriter) Writer() *ObjectWriter {
	return NewObjectWriter(p.File)
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

// Merges the inner contents of the input events objects into a large JSON array
func (w *CompressedJSONArrayWriter) WriteEvents(events *model.EventsObject) error {
	var eventsObj struct {
		Events []interface{}
	}

	// EventsObject.Events is a string with the format "{events:[{...},{...},...]}"
	// Unmarshal this string, then marshal the inner array
	if err := json.Unmarshal([]byte(events.Events), &eventsObj); err != nil {
		return errors.Wrap(err, "error unmarshalling events")
	}
	if len(eventsObj.Events) == 0 {
		return nil
	}
	remarshalled, err := json.Marshal(eventsObj.Events)
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
	}
	if err := w.writer.Close(); err != nil {
		return errors.Wrap(err, "error closing writer")
	}
	return nil
}

type PayloadManager struct {
	Events           *PayloadReadWriter
	Resources        *PayloadReadWriter
	Messages         *PayloadReadWriter
	EventsCompressed *CompressedJSONArrayWriter
}

func NewPayloadManager(eventsFile *os.File, resourcesFile *os.File, messagesFile *os.File, eventsCompressedFile *os.File) *PayloadManager {
	reader := &PayloadManager{}
	reader.Events = NewPayloadReadWriter(eventsFile)
	reader.Resources = NewPayloadReadWriter(resourcesFile)
	reader.Messages = NewPayloadReadWriter(messagesFile)
	reader.EventsCompressed = NewCompressedJSONArrayWriter(eventsCompressedFile)
	return reader
}
