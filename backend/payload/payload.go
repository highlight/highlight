package payload

import (
	"bufio"
	"os"
	"strings"

	"github.com/highlight-run/highlight/backend/model"
	"github.com/pkg/errors"
)

var Delimiter = "\n\n\n"

type PayloadReadWriter struct {
	file *os.File
}

func NewPayloadReadWriter(file *os.File) *PayloadReadWriter {
	p := &PayloadReadWriter{file: file}
	return p
}

func (p *PayloadReadWriter) Close() {
	p.file.Close()
	os.Remove(p.file.Name())
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

func (o *ObjectReader) Next() (s string, e error) {
	line := ""
	// Keep reading until the end of the line has the delimitter.
	for {
		str := ""
		str, err := o.reader.ReadString(Delimiter[len(Delimiter)-1])
		if err != nil {
			return
		}
		line = line + str
		if strings.HasSuffix(line, Delimiter) {
			ret := line[:len(line)-len(Delimiter)]
			return ret, nil
		}
	}
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

func (p *PayloadManager) Close() {
	p.Events.Close()
	p.Resources.Close()
	p.Messages.Close()
}
