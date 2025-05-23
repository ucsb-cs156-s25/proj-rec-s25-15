import { render, screen, waitFor } from "@testing-library/react";
import StudentProfileIndexPage from "main/pages/StudentProfile/StudentProfileIndexPage";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import mockConsole from "jest-mock-console";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
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

describe("StudentProfileIndexPage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  const setupUserOnly = () => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  };

  const setupStudentUser = () => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.studentUser);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  };

  const queryClient = new QueryClient();

  test("Renders with Create Button for student user", async () => {
    setupStudentUser();
    axiosMock.onGet("/api/recommendationrequest/requester/all").reply(200, []);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <StudentProfileIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByText(/Create a new Recommendation Request/),
      ).toBeInTheDocument();
    });
    const button = screen.getByText(/Create a new Recommendation Request/);
    expect(button).toHaveAttribute("href", "/requests/create");
    expect(button).toHaveAttribute("style", "float: right;");
  });

  test("renders empty table when backend unavailable, user only", async () => {
    setupUserOnly();

    axiosMock.onGet("/api/recommendationrequest/requester/all").timeout();

    const restoreConsole = mockConsole();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <StudentProfileIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(axiosMock.history.get.length).toBeGreaterThanOrEqual(1);
    });

    const errorMessage = console.error.mock.calls[0][0];
    expect(errorMessage).toMatch(
      "Error communicating with backend via GET on /api/recommendationrequest/requester/all",
    );
    restoreConsole();
  });

  test("outer and inner div have correct styles", async () => {
    setupStudentUser();
    axiosMock.onGet("/api/recommendationrequest/requester/all").reply(200, []);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <StudentProfileIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const outerDiv = await screen.findByTestId("left-div");
    expect(outerDiv).toHaveStyle("margin-left: -180px");

    const innerDiv = screen.getByTestId("top-div");
    expect(innerDiv).toHaveStyle("margin-top: 40px");
  });
});
