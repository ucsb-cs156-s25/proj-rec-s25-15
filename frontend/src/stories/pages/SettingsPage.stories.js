import React from "react";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { http, HttpResponse } from "msw";

import SettingsPage from "main/pages/SettingsPage";

export default {
  title: "pages/SettingsPage",
  component: SettingsPage,
};

const Template = () => <SettingsPage storybook={true} />;

export const Admin = Template.bind({});
Admin.parameters = {
  msw: [
    http.get("/api/currentUser", () => {
      return HttpResponse.json(apiCurrentUserFixtures.adminUser, {
        status: 200,
      });
    }),
    http.get("/api/systemInfo", () => {
      return HttpResponse.json(systemInfoFixtures.showingNeither, {
        status: 200,
      });
    }),
    http.get("/api/requesttypes/all", () => {
      return HttpResponse.json([], { status: 200 });
    }),
  ],
};

export const Instructor = Template.bind({});
Instructor.parameters = {
  msw: [
    http.get("/api/currentUser", () => {
      return HttpResponse.json(apiCurrentUserFixtures.professorUser, {
        status: 200,
      });
    }),
    http.get("/api/systemInfo", () => {
      return HttpResponse.json(systemInfoFixtures.showingNeither, {
        status: 200,
      });
    }),
    http.get("/api/requesttypes/all", () => {
      return HttpResponse.json([], { status: 200 });
    }),
  ],
};
