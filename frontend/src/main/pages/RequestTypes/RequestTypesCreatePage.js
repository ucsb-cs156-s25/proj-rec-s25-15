import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import RequestTypeForm from "main/components/RequestType/RequestTypeForm";
import { Navigate } from "react-router-dom";
import { useBackendMutation } from "main/utils/useBackend";
import { toast } from "react-toastify";

export default function RequestTypesCreatePage({ storybook = false }) {
  const objectToAxiosParams = (requestTypes) => ({
    url: "/api/requesttypes/post",
    method: "POST",
    params: {
      requestType: requestTypes.requestType,
    },
  });

  const onSuccess = (requestTypes) => {
    toast(
      `New Request Type Created - id: ${requestTypes.id} requestType: ${requestTypes.requestType}`,
    );
  };

  const onError = (error) => {
    toast(`Error: ${error.response.data.message}`);
  };

  const mutation = useBackendMutation(
    objectToAxiosParams,
    { onSuccess, onError },
    // Stryker disable next-line all : hard to set up test for caching
    ["/api/requesttypes/all"], // mutation makes this key stale so that pages relying on it reload
  );

  const { isSuccess } = mutation;

  const onSubmit = async (data) => {
    mutation.mutate(data);
  };

  if (isSuccess && !storybook) {
    return <Navigate to="/settings/requesttypes" />;
  }

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Create New Request Type</h1>
        <RequestTypeForm submitAction={onSubmit} />
      </div>
    </BasicLayout>
  );
}
