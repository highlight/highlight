package main

import (
	"encoding/json"
	"os"

	e "github.com/pkg/errors"
	log "github.com/sirupsen/logrus"

	"github.com/highlight-run/highlight/backend/model"
	modelInputs "github.com/highlight-run/highlight/backend/private-graph/graph/model"
)

func main() {
	log.Info("setting up db")
	db, err := model.SetupDB(os.Getenv("PSQL_DB"))
	if err != nil {
		log.Fatalf("error setting up db: %+v", err)
	}
	var errorGroups []model.ErrorGroup
	if err := db.Debug().Model(&model.ErrorGroup{}).Where("mapped_stack_trace IS NOT NULL").Scan(&errorGroups).Error; err != nil {
		log.Error(e.Wrap(err, "error fetching error groups"))
		return
	}
	for i := range errorGroups {
		if errorGroups[i].MappedStackTrace == nil || *errorGroups[i].MappedStackTrace == "" {
			continue
		}
		var oldStackTrace []*struct {
			FileName     *string `json:"file_name"`
			LineNumber   *int    `json:"line_number"`
			FunctionName *string `json:"function_name"`
			ColumnNumber *int    `json:"column_number"`
		}
		if err := json.Unmarshal([]byte(*errorGroups[i].MappedStackTrace), &oldStackTrace); err != nil {
			log.WithFields(log.Fields{"error_group_id": errorGroups[i].ID, "project_id": errorGroups[i].ProjectID}).Error(e.Wrapf(err, "error unmarshalling MappedStackTrace"))
			continue
		}
		var newStackTrace []*modelInputs.ErrorTrace
		for _, t := range oldStackTrace {
			val := &modelInputs.ErrorTrace{
				FileName:     t.FileName,
				LineNumber:   t.LineNumber,
				FunctionName: t.FunctionName,
				ColumnNumber: t.ColumnNumber,
			}
			newStackTrace = append(newStackTrace, val)
		}
		newStackTraceBytes, err := json.Marshal(&newStackTrace)
		if err != nil {
			log.WithFields(log.Fields{"error_group_id": errorGroups[i].ID, "project_id": errorGroups[i].ProjectID}).Error(e.Wrapf(err, "error marshalling MappedStackTrace"))
			continue
		}
		newStackTraceString := string(newStackTraceBytes)
		if err := db.Debug().Where(&model.ErrorGroup{Model: model.Model{ID: errorGroups[i].ID}}).Updates(&model.ErrorGroup{MappedStackTrace: &newStackTraceString}).Error; err != nil {
			log.WithFields(log.Fields{"error_group_id": errorGroups[i].ID, "project_id": errorGroups[i].ProjectID}).Error(e.Wrapf(err, "error saving MappedStackTrace"))
			continue
		}
	}
}
