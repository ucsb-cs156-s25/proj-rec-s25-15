import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import StudentProfileEditPage from "main/pages/StudentProfile/StudentProfileEditPage";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import usersFixtures from "fixtures/usersFixtures";
import recommendationTypeFixtures from "fixtures/recommendationTypeFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import mockConsole from "jest-mock-console";

const mockToast = jest.fn();
jest.mock("react-toastify", () => {
  const originalModule = jest.requireActual("react-toastify");
  return {
    __esModule: true,
    ...originalModule,
    toast: (x) => mockToast(x),
  };
});

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  const originalModule = jest.requireActual("react-router-dom");
  return {
    __esModule: true,
    ...originalModule,
    useParams: () => ({
      id: 17,
    }),
    Navigate: (x) => {
      mockNavigate(x);
      return null;
    },
  };
});

describe("StudentProfileEditPage tests", () => {
  describe("when the backend doesn't return data", () => {
    const axiosMock = new AxiosMockAdapter(axios);
    let fetchMock;

    beforeEach(() => {
      axiosMock.reset();
      axiosMock.resetHistory();
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      axiosMock
        .onGet("/api/recommendationrequest", { params: { id: 17 } })
        .timeout();

      fetchMock = jest
        .spyOn(global, "fetch")
        .mockImplementation(async (url) => {
          if (url === "/api/admin/users/professors") {
            return {
              ok: true,
              status: 200,
              json: async () => usersFixtures.twoProfessors,
            };
          }
          if (url === "/api/requesttypes/all") {
            return {
              ok: true,
              status: 200,
              json: async () => recommendationTypeFixtures.fourTypes,
            };
          }
          console.error(`Unhandled fetch call to ${url}`);
          return Promise.reject(new Error(`Unhandled fetch call to ${url}`));
        });
    });

    afterEach(() => {
      fetchMock.mockRestore();
    });

    const queryClient = new QueryClient();
    test("renders header but table is not present", async () => {
      const restoreConsole = mockConsole();

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <StudentProfileEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );
      await screen.findByText("Edit Recommendation Request");
      expect(
        screen.queryByTestId("RecommendationRequest-requesterName"),
      ).not.toBeInTheDocument();
      restoreConsole();
    });
  });

  describe("tests where backend is working normally", () => {
    const axiosMock = new AxiosMockAdapter(axios);
    let fetchMock;

    beforeEach(() => {
      axiosMock.reset();
      axiosMock.resetHistory();

      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      axiosMock
        .onGet("/api/recommendationrequest", { params: { id: 17 } })
        .reply(200, {
          id: 17,
          professor: {
            id: usersFixtures.twoProfessors[0].id,
            fullName: usersFixtures.twoProfessors[0].fullName,
          },
          recommendationType:
            recommendationTypeFixtures.fourTypes[0].requestType,
          details: "Test",
          dueDate: "2025-06-01T00:00:00",
        });
      axiosMock.onPut("/api/recommendationrequest").reply(200, {
        id: 17,
        professor: {
          id: usersFixtures.twoProfessors[1].id,
          fullName: "new prof name",
        },
        recommendationType: recommendationTypeFixtures.fourTypes[1].requestType,
        details: "Test details",
        dueDate: "2025-05-19T00:00:00",
      });

      const fetchMockResponses = {
        "/api/admin/users/professors": {
          status: 200,
          body: usersFixtures.twoProfessors,
        },
        "/api/requesttypes/all": {
          status: 200,
          body: recommendationTypeFixtures.fourTypes,
        },
      };

      fetchMock = jest
        .spyOn(global, "fetch")
        .mockImplementation(async (url) => {
          const match = fetchMockResponses[url];
          if (match) {
            return {
              ok: true,
              status: match.status,
              json: async () => match.body,
            };
          }

          console.error(`Unhandled fetch call to ${url}`);
          return Promise.reject(new Error(`Unhandled fetch call to ${url}`));
        });
    });

    afterEach(() => {
      fetchMock.mockRestore();
    });

    const queryClient = new QueryClient();

    test("Is populated with the data provided and submits updated data", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <StudentProfileEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await waitFor(() => {
        expect(
          screen.getByDisplayValue(usersFixtures.twoProfessors[0].fullName),
        ).toBeInTheDocument();
      });
      const professorField = screen.getByTestId(
        "RecommendationRequestForm-professor_id",
      );
      expect(professorField).toHaveValue(
        usersFixtures.twoProfessors[0].id.toString(),
      );
      expect(screen.getByLabelText("Recommendation Type")).toHaveValue("Other");
      expect(screen.getByLabelText("Details")).toHaveValue("Test");
      expect(screen.getByLabelText("Due Date")).toHaveValue("2025-06-01");

      const recommendationTypeField = screen.getByLabelText(
        "Recommendation Type",
      );
      const detailsField = screen.getByLabelText("Details");
      const dueDateField = screen.getByLabelText("Due Date");
      const submitButton = screen.getByRole("button", { name: "Update" });

      fireEvent.change(professorField, {
        target: { value: usersFixtures.twoProfessors[1].id.toString() },
      });
      fireEvent.change(recommendationTypeField, {
        target: { value: recommendationTypeFixtures.fourTypes[1].requestType },
      });
      fireEvent.change(detailsField, { target: { value: "Test details" } });
      fireEvent.change(dueDateField, { target: { value: "2025-05-19" } });

      fireEvent.click(submitButton);

      await waitFor(() =>
        expect(mockToast).toHaveBeenCalledWith(
          "Recommendation Request Updated - id: 17",
        ),
      );

      expect(mockNavigate).toHaveBeenCalledWith({ to: "/requests" });

      expect(axiosMock.history.put.length).toBe(1);
      expect(axiosMock.history.put[0].params).toEqual({ id: 17 });
      expect(JSON.parse(axiosMock.history.put[0].data)).toEqual({
        professorId: usersFixtures.twoProfessors[1].id.toString(),
        recommendationType: recommendationTypeFixtures.fourTypes[1].requestType,
        details: "Test details",
        dueDate: "2025-05-19T00:00:00",
      });
    });
  });
});
