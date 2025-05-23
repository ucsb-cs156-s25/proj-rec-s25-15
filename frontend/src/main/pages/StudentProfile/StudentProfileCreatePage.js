import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import RecommendationRequestForm from "main/components/RecommendationRequest/RecommendationRequestForm";
import { Navigate } from "react-router-dom";
import { useBackendMutation } from "main/utils/useBackend";
import { toast } from "react-toastify";

export default function StudentProfileCreatePage({ storybook = false }) {
  const objectToAxiosParams = (recommendationrequest) => ({
    url: "/api/recommendationrequest/post",
    method: "POST",
    params: {
      professorId: recommendationrequest.professor_id,
      recommendationType: recommendationrequest.recommendationType,
      details: recommendationrequest.details,
      dueDate: recommendationrequest.dueDate,
    },
  });

  const onSuccess = (recommendationrequest) => {
    toast(
      `New Recommendation Request Created - id: ${recommendationrequest.id}`,
    );
  };

  const mutation = useBackendMutation(
    objectToAxiosParams,
    { onSuccess },
    // Stryker disable next-line all : hard to set up test for caching
    ["/api/recommendationrequest/all"], // mutation makes this key stale so that pages relying on it reload
  );

  const { isSuccess } = mutation;

  const onSubmit = async (data) => {
    mutation.mutate(data);
  };

  if (isSuccess && !storybook) {
    return <Navigate to="/requests" />;
  }

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Create a new Recommendation Request</h1>
        <RecommendationRequestForm submitAction={onSubmit} />
      </div>
    </BasicLayout>
  );
}
