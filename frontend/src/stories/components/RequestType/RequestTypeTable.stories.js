import React from "react";
import RequestTypeTable from "main/components/RequestType/RequestTypeTable";
import requestTypeFixtures from "fixtures/requestTypeFixtures";
import { currentUserFixtures } from "fixtures/currentUserFixtures";
import { http, HttpResponse } from "msw";

export default {
  title: "components/RequestType/RequestTypeTable",
  component: RequestTypeTable,
};

const Template = (args) => {
  return <RequestTypeTable {...args} />;
};

export const Empty = Template.bind({});

Empty.args = {
  requestTypes: [],
};

export const FourTypesOrdinaryUser = Template.bind({});

FourTypesOrdinaryUser.args = {
  requestTypes: requestTypeFixtures.fourTypes,
  currentUser: currentUserFixtures.userOnly,
};

export const FourTypesAdminUser = Template.bind({});
FourTypesAdminUser.args = {
  requestTypes: requestTypeFixtures.fourTypes,
  currentUser: currentUserFixtures.adminUser,
};

FourTypesAdminUser.parameters = {
  msw: [
    http.delete("/api/requestTypes", () => {
      return HttpResponse.json({}, { status: 200 });
    }),
  ],
};

export const FourTypesProfessorUser = Template.bind({});
FourTypesProfessorUser.args = {
  requestTypes: requestTypeFixtures.fourTypes,
  currentUser: currentUserFixtures.adminUser,
};

FourTypesProfessorUser.parameters = {
  msw: [
    http.delete("/api/requestTypes", () => {
      return HttpResponse.json({}, { status: 200 });
    }),
  ],
};
