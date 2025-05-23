import React from "react";
import { useBackend } from "main/utils/useBackend";

import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import RecommendationRequestTable from "main/components/RecommendationRequest/RecommendationRequestTable";
import { useCurrentUser } from "main/utils/currentUser";
import { Button } from "react-bootstrap";

export default function StudentProfileIndexPage() {
  const currentUser = useCurrentUser();

  const {
    data: recommendationrequests,
    error: _error,
    status: _status,
  } = useBackend(
    // Stryker disable next-line all : don't test internal caching of React Query
    ["/api/recommendationrequest/requester/all"],
    { method: "GET", url: "/api/recommendationrequest/requester/all" },
    // Stryker disable next-line all : don't test default value of empty list
    [],
  );

  const createButton = () => {
    return (
      <Button
        variant="primary"
        href="/requests/create"
        style={{ float: "right" }}
      >
        Create a new Recommendation Request
      </Button>
    );
  };

  return (
    <BasicLayout>
      <div className="pt-2">
        {createButton()}
        <h1>My Requests</h1>
        <div data-testid="left-div" style={{ marginLeft: "-180px" }}>
          <div data-testid="top-div" style={{ marginTop: "40px" }}>
            <RecommendationRequestTable
              requests={recommendationrequests}
              currentUser={currentUser}
            />
          </div>
        </div>
      </div>
    </BasicLayout>
  );
}
