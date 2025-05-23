import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RequestTypesCreatePage from "main/pages/RequestTypes/RequestTypesCreatePage";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";

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

describe("RequestTypesCreatePage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

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
  });

  const queryClient = new QueryClient();
  test("renders without crashing", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RequestTypesCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Request Type")).toBeInTheDocument();
    });
  });

  test("on submit, makes request to backend, and redirects to /settings/requesttypes", async () => {
    const queryClient = new QueryClient();
    const requestType = {
      id: 123,
      requestType: "University Transfer",
    };

    axiosMock.onPost("/api/requesttypes/post").reply(202, requestType);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RequestTypesCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Request Type")).toBeInTheDocument();
    });

    const requestTypeInput = screen.getByLabelText("Request Type");
    expect(requestTypeInput).toBeInTheDocument();

    const createButton = screen.getByText("Create");
    expect(createButton).toBeInTheDocument();

    fireEvent.change(requestTypeInput, {
      target: {
        value: "University Transfer",
      },
    });

    fireEvent.click(createButton);

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].params).toEqual({
      requestType: "University Transfer",
    });

    // assert - check that the toast was called with the expected message
    expect(mockToast).toHaveBeenCalledWith(
      "New Request Type Created - id: 123 requestType: University Transfer",
    );
    expect(mockNavigate).toHaveBeenCalledWith({ to: "/settings/requesttypes" });
  });

  test("on submit with duplicate type, makes request to backend, does not exit page", async () => {
    const queryClient = new QueryClient();
    const errorMessage = "Duplicate request type: Duplicate Type";

    axiosMock
      .onPost("/api/requesttypes/post")
      .reply(400, { message: "Duplicate request type: Duplicate Type" });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RequestTypesCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Request Type")).toBeInTheDocument();
    });

    const requestTypeInput = screen.getByLabelText("Request Type");
    expect(requestTypeInput).toBeInTheDocument();

    const createButton = screen.getByText("Create");
    expect(createButton).toBeInTheDocument();

    fireEvent.change(requestTypeInput, {
      target: {
        value: "Duplicate Type",
      },
    });

    fireEvent.click(createButton);

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].params).toEqual({
      requestType: "Duplicate Type",
    });

    // assert - check that the toast was called with the expected message
    expect(mockToast).toHaveBeenNthCalledWith(
      1,
      `Axios Error: Error: Request failed with status code 400`,
    );
    expect(mockToast).toHaveBeenNthCalledWith(2, `Error: ${errorMessage}`);
    expect(mockNavigate).not.toHaveBeenCalledWith({
      to: "/settings/requesttypes",
    });

    // Check the duplicate input is still in the form
    expect(screen.getByLabelText("Request Type")).toHaveValue("Duplicate Type");
  });
});
