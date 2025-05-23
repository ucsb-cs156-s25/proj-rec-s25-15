import React from "react";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { http, HttpResponse } from "msw";

import StudentProfileEditPage from "main/pages/StudentProfile/StudentProfileEditPage";
import { usersFixtures } from "fixtures/usersFixtures";
import { recommendationTypeFixtures } from "fixtures/recommendationTypeFixtures";
import { recommendationRequestFixtures } from "fixtures/recommendationRequestFixtures";

export default {
  title: "pages/StudentProfile/StudentProfileEditPage",
  component: StudentProfileEditPage,
};

const Template = () => <StudentProfileEditPage storybook={true} />;

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

    http.get("/api/recommendationrequest", () => {
      return HttpResponse.json(
        recommendationRequestFixtures.threeRecommendations[1],
        { status: 200 },
      );
    }),

    http.put("/api/recommendationrequest", () => {
      return HttpResponse.json(
        {
          id: 17,
          professor: { id: 2, fullName: "New Professor" },
          recommendationType: "Other",
          details: "Updated details",
          dueDate: "2025-06-01T00:00:00",
        },
        { status: 200 },
      );
    }),

    http.get("/api/admin/users/professors", () => {
      return HttpResponse.json(usersFixtures.twoProfessors, { status: 200 });
    }),

    http.get("/api/requesttypes/all", () => {
      return HttpResponse.json(recommendationTypeFixtures.fourTypes, {
        status: 200,
      });
    }),
  ],
};
