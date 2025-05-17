import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import requestTypeFixtures from "fixtures/requestTypeFixtures";
import RequestTypeTable from "main/components/RequestType/RequestTypeTable";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import { currentUserFixtures } from "fixtures/currentUserFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

const mockedNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedNavigate,
}));

describe("UserTable tests", () => {
  const queryClient = new QueryClient();

  test("has the expected column headers and content for ordinary user", () => {
    const currentUser = currentUserFixtures.userOnly;

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RequestTypeTable
            requestTypes={requestTypeFixtures.fourTypes}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const expectedHeaders = ["id", "Request Type"];
    const expectedFields = ["id", "requestType"];
    const testId = "RequestTypeTable";

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expectedFields.forEach((field) => {
      const header = screen.getByTestId(`${testId}-cell-row-0-col-${field}`);
      expect(header).toBeInTheDocument();
    });

    expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent(
      "1",
    );
    expect(screen.getByTestId(`${testId}-cell-row-1-col-id`)).toHaveTextContent(
      "2",
    );
    expect(screen.getByTestId(`${testId}-cell-row-2-col-id`)).toHaveTextContent(
      "3",
    );
    expect(screen.getByTestId(`${testId}-cell-row-3-col-id`)).toHaveTextContent(
      "4",
    );

    const editButton = screen.queryByTestId(
      `${testId}-cell-row-0-col-Edit-button`,
    );
    expect(editButton).not.toBeInTheDocument();

    const deleteButton = screen.queryByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );
    expect(deleteButton).not.toBeInTheDocument();
  });

  function testRequestTypeTableForAdminProfessor(currentUser) {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RequestTypeTable
            requestTypes={requestTypeFixtures.fourTypes}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    const expectedHeaders = ["id", "Request Type"];
    const expectedFields = ["id", "requestType"];
    const testId = "RequestTypeTable";

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expectedFields.forEach((field) => {
      const header = screen.getByTestId(`${testId}-cell-row-0-col-${field}`);
      expect(header).toBeInTheDocument();
    });

    expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent(
      "1",
    );
    expect(screen.getByTestId(`${testId}-cell-row-1-col-id`)).toHaveTextContent(
      "2",
    );

    const editButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Edit-button`,
    );
    expect(editButton).toBeInTheDocument();
    expect(editButton).toHaveClass("btn-primary");

    const deleteButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );
    expect(deleteButton).toBeInTheDocument();
    expect(deleteButton).toHaveClass("btn-danger");
  }

  test("has the expected column headers and content for admin user", () => {
    testRequestTypeTableForAdminProfessor(currentUserFixtures.adminUser);
  });

  test("has the expected column headers and content for professor user", () => {
    testRequestTypeTableForAdminProfessor(currentUserFixtures.professorUser);
  });

  async function testEditButtonNavigatesToEditPageForAdminProfessor(
    currentUser,
  ) {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RequestTypeTable
            requestTypes={requestTypeFixtures.fourTypes}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId(`RequestTypeTable-cell-row-0-col-id`),
      ).toHaveTextContent("1");
    });

    const editButton = screen.getByTestId(
      `RequestTypeTable-cell-row-0-col-Edit-button`,
    );
    expect(editButton).toBeInTheDocument();

    fireEvent.click(editButton);

    await waitFor(() =>
      expect(mockedNavigate).toHaveBeenCalledWith("/requestTypes/edit/1"),
    );
  }

  test("edit button navigates to the edit page for admin user", async () => {
    await testEditButtonNavigatesToEditPageForAdminProfessor(
      currentUserFixtures.adminUser,
    );
  });

  test("edit button navigates to the edit page for professor user", async () => {
    await testEditButtonNavigatesToEditPageForAdminProfessor(
      currentUserFixtures.professorUser,
    );
  });

  async function deleteButtonCallsDeleteCallback(currentUser) {
    const axiosMock = new AxiosMockAdapter(axios);
    axiosMock
      .onDelete("/api/requestTypes")
      .reply(200, { message: "Request Type deleted" });

    // act - render the component
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RequestTypeTable
            requestTypes={requestTypeFixtures.fourTypes}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // assert - check that the expected content is rendered

    await waitFor(() => {
      expect(
        screen.getByTestId(`RequestTypeTable-cell-row-0-col-id`),
      ).toHaveTextContent("1");
    });

    const deleteButton = screen.getByTestId(
      `RequestTypeTable-cell-row-0-col-Delete-button`,
    );
    expect(deleteButton).toBeInTheDocument();

    // act - click the delete button
    fireEvent.click(deleteButton);

    // assert - check that the delete endpoint was called

    await waitFor(() => expect(axiosMock.history.delete.length).toBe(1));
    expect(axiosMock.history.delete[0].params).toEqual({ id: 1 });
  }
  test("delete button calls delete callback for admin user", async () => {
    await deleteButtonCallsDeleteCallback(currentUserFixtures.adminUser);
  });
  test("delete button calls delete callback for professor user", async () => {
    await deleteButtonCallsDeleteCallback(currentUserFixtures.adminUser);
  });
});
