import React from "react";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { recommendationRequestFixtures } from "fixtures/recommendationRequestFixtures";
import { http, HttpResponse } from "msw";

import StudentProfileIndexPage from "main/pages/StudentProfile/StudentProfileIndexPage";

export default {
  title: "pages/StudentProfile/StudentProfileIndexPage",
  component: StudentProfileIndexPage,
};

const Template = () => <StudentProfileIndexPage storybook={true} />;

export const Empty = Template.bind({});
Empty.parameters = {
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
    http.get("/api/recommendationrequest/requester/all", () => {
      return HttpResponse.json([], { status: 200 });
    }),
  ],
};

export const ThreeItemsOrdinaryUser = Template.bind({});

ThreeItemsOrdinaryUser.parameters = {
  msw: [
    http.get("/api/currentUser", () => {
      return HttpResponse.json(apiCurrentUserFixtures.userOnly);
    }),
    http.get("/api/systemInfo", () => {
      return HttpResponse.json(systemInfoFixtures.showingNeither);
    }),
    http.get("/api/recommendationrequest/requester/all", () => {
      return HttpResponse.json(
        recommendationRequestFixtures.threeRecommendations,
      );
    }),
  ],
};

export const ThreeItemsAdminUser = Template.bind({});

ThreeItemsAdminUser.parameters = {
  msw: [
    http.get("/api/currentUser", () => {
      return HttpResponse.json(apiCurrentUserFixtures.adminUser);
    }),
    http.get("/api/systemInfo", () => {
      return HttpResponse.json(systemInfoFixtures.showingNeither);
    }),
    http.get("/api/recommendationrequest/requester/all", () => {
      return HttpResponse.json(
        recommendationRequestFixtures.threeRecommendations,
      );
    }),
    http.delete("/api/recommendationrequest", () => {
      return HttpResponse.json(
        { message: "Recommendation Request deleted successfully" },
        { status: 200 },
      );
    }),
  ],
};
