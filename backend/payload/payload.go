package payload

import (
	"bufio"
	"io"
	"os"
	"strings"

	"github.com/highlight-run/highlight/backend/model"
	"github.com/pkg/errors"
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
		strBytes, isPrefix, err := o.reader.ReadLine()
		str := string(strBytes)
		if err != nil {
			if errors.Is(err, io.EOF) {
				line += str
				e = err
				break
			}
			return nil, errors.Wrap(err, "error reading line from bufio reader")
		}
		if strings.HasSuffix(str, Delimiter) {
			str = str[:len(str)-len(Delimiter)]
			line += str
			break
		}
		line += str
		if !isPrefix {
			line += "\n"
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

type PayloadManager struct {
	Events    *PayloadReadWriter
	Resources *PayloadReadWriter
	Messages  *PayloadReadWriter
}

func NewPayloadManager(eventsFile *os.File, resourcesFile *os.File, messagesFile *os.File) *PayloadManager {
	reader := &PayloadManager{}
	reader.Events = NewPayloadReadWriter(eventsFile)
	reader.Resources = NewPayloadReadWriter(resourcesFile)
	reader.Messages = NewPayloadReadWriter(messagesFile)
	return reader
}
