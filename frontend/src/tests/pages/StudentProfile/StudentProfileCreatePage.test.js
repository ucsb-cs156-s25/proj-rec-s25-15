import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import StudentProfileCreatePage from "main/pages/StudentProfile/StudentProfileCreatePage";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import usersFixtures from "fixtures/usersFixtures";
import recommendationTypeFixtures from "fixtures/recommendationTypeFixtures";

import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

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
    Navigate: (x) => {
      mockNavigate(x);
      return null;
    },
  };
});

describe("StudentProfileCreatePage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);
  let fetchMock;

  beforeEach(() => {
    jest.clearAllMocks();
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);

    fetchMock = jest.spyOn(global, "fetch").mockImplementation(async (url) => {
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
  test("renders without crashing", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <StudentProfileCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Professor")).toBeInTheDocument();
    });
  });

  test("on submit, makes request to backend, and redirects to /requests", async () => {
    const queryClient = new QueryClient();
    const recommendationrequest = {
      id: 3,
      professorId: 2,
      recommendationType: "CS Department BS/MS program",
      details: "Test",
      dueDate: "2022-04-02T00:00:00",
    };

    axiosMock
      .onPost("/api/recommendationrequest/post")
      .reply(202, recommendationrequest);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <StudentProfileCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Professor")).toBeInTheDocument();
    });
    expect(
      screen.getByText(usersFixtures.twoProfessors[0].fullName),
    ).toBeInTheDocument();
    expect(
      screen.getByText(recommendationTypeFixtures.fourTypes[0].requestType),
    ).toBeInTheDocument();

    const professorIdInput = screen.getByLabelText("Professor");
    expect(professorIdInput).toBeInTheDocument();

    const recommmendationTypeInput = screen.getByLabelText(
      "Recommendation Type",
    );
    expect(recommmendationTypeInput).toBeInTheDocument();

    const detailsInput = screen.getByLabelText("Details");
    expect(detailsInput).toBeInTheDocument();

    const dueDateInput = screen.getByLabelText("Due Date");
    expect(dueDateInput).toBeInTheDocument();

    const createButton = screen.getByText("Create");
    expect(createButton).toBeInTheDocument();

    fireEvent.change(professorIdInput, { target: { value: 1 } });
    fireEvent.change(recommmendationTypeInput, {
      target: { value: "Other" },
    });
    fireEvent.change(detailsInput, { target: { value: "Test details" } });
    fireEvent.change(dueDateInput, { target: { value: "2025-05-19" } });
    fireEvent.click(createButton);

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    const postParams = axiosMock.history.post[0].params;
    expect(postParams).toEqual({
      professorId: "1",
      recommendationType: "Other",
      details: "Test details",
      dueDate: "2025-05-19T00:00:00",
    });

    expect(mockToast).toHaveBeenCalledWith(
      "New Recommendation Request Created - id: 3",
    );
    expect(mockNavigate).toHaveBeenCalledWith({ to: "/requests" });
  });
});
