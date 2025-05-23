import React from "react";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { http, HttpResponse } from "msw";

import RequestTypesCreatePage from "main/pages/RequestTypes/RequestTypesCreatePage";

export default {
  title: "pages/RequestTypes/RequestTypesCreatePage",
  component: RequestTypesCreatePage,
};

const Template = () => <RequestTypesCreatePage storybook={true} />;

export const Default = Template.bind({});
Default.parameters = {
  msw: [
    http.get("/api/currentUser", () => {
      return HttpResponse.json(apiCurrentUserFixtures.userOnly, {
        status: 200,
      });
    }),
    http.get("/api/systemInfo", () => {
      return HttpResponse.json(systemInfoFixtures.showingNeither, {
        status: 200,
      });
    }),
    http.post("/api/requesttypes/post", () => {
      return HttpResponse.json({}, { status: 200 });
    }),
  ],
};
