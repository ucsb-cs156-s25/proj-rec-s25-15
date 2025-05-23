import { render, waitFor, fireEvent, screen } from "@testing-library/react";
import RequestTypeForm from "main/components/RequestType/RequestTypeForm";
import recommendationTypeFixtures from "fixtures/recommendationTypeFixtures";
import { BrowserRouter as Router } from "react-router-dom";

const mockedNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedNavigate,
}));

describe("RequestTypeForm tests", () => {
  test("renders correctly", async () => {
    render(
      <Router>
        <RequestTypeForm />
      </Router>,
    );
    await screen.findByText(/Request Type/);
    await screen.findByText(/Create/);
  });

  test("renders correctly when passing in a request type", async () => {
    render(
      <Router>
        <RequestTypeForm initialContents={recommendationTypeFixtures.oneType} />
      </Router>,
    );
    await screen.findByText(/Request Type/);
    expect(screen.getByText(/Id/)).toBeInTheDocument();
  });

  test("correct Error messsages on bad input", async () => {
    render(
      <Router>
        <RequestTypeForm />
      </Router>,
    );
    await screen.findByText(/Request Type/);

    const requestTypeField = screen.getByLabelText("Request Type");
    const submitButton = screen.getByRole("button", { name: /create/i });
    fireEvent.change(requestTypeField, { target: { value: "a".repeat(256) } });
    fireEvent.click(submitButton);

    await screen.findByText(/Request Type cannot exceed 255 characters./);
  });

  test("correct error messsages on missing input", async () => {
    render(
      <Router>
        <RequestTypeForm />
      </Router>,
    );
    await screen.findByText(/Create/);
    const submitButton = screen.getByRole("button", { name: /create/i });

    fireEvent.click(submitButton);

    await screen.findByText(/Please enter a valid Request Type./);
  });

  test("no error messsages on good input", async () => {
    const mockSubmitAction = jest.fn();

    render(
      <Router>
        <RequestTypeForm submitAction={mockSubmitAction} />
      </Router>,
    );
    await screen.findByText(/Request Type/);

    const requestTypeField = screen.getByLabelText("Request Type");
    const submitButton = screen.getByRole("button", { name: /create/i });

    fireEvent.change(requestTypeField, {
      target: { value: "Guest Speaker Invitation" },
    });
    fireEvent.click(submitButton);
    await waitFor(() => expect(mockSubmitAction).toHaveBeenCalled());

    expect(
      screen.queryByText(/Please enter a valid Request Type./),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Request Type cannot exceed 255 characters./),
    ).not.toBeInTheDocument();
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    render(
      <Router>
        <RequestTypeForm />
      </Router>,
    );
    await screen.findByText(/Cancel/);
    const cancelButton = screen.getByRole("button", { name: /cancel/i });

    fireEvent.click(cancelButton);

    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });
});
