package util

import (
	"os"

	"github.com/pkg/errors"
	log "github.com/sirupsen/logrus"
)

func cleanup(file *os.File) {
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
}

func CreateFile(name string) (func(), *os.File, error) {
	file, err := os.Create(name)
	if err != nil {
		return nil, nil, errors.Wrap(err, "error creating file")
	}
	return func() { cleanup(file) }, file, nil
}

func OpenFile(name string) (func(), *os.File, error) {
	file, err := os.Open(name)
	if err != nil {
		return nil, nil, errors.Wrap(err, "error opening file")
	}
	return func() { cleanup(file) }, file, nil
}
