package mocks

import (
	modelInputs "github.com/jay-khatri/fullstory/backend/main-graph/graph/model"
	"github.com/jay-khatri/fullstory/backend/model"
	"github.com/jay-khatri/fullstory/graph/model"
	"github.com/stretchr/testify/mock"
)

type MockedGormDB struct {
	mock.Mock
}

func (s *MockedGormDB) SessionsBeta(organizationID int, count int, params *modelInputs.SearchParamsInput) (*model.SessionResults, error) {
	args := s.Called(organizationID, count, params) //not sure what to do here
	return args.Get(0).(*model.SessionResults)
}
