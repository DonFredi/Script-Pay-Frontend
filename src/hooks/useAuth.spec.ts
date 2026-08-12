import { renderHook, act, waitFor } from "@testing-library/react";
import api from "@/shared/lib/api-client";

jest.mock("@/shared/lib/api-client");

describe("useAuth", () => {
  it("should login user", async () => {
    const mockApi = api as jest.Mocked<typeof api>;
    mockApi.post.mockResolvedValueOnce({
      data: {
        user: { id: "1", email: "test@example.com" },
        accessToken: "token",
      },
    });

    const { result } = renderHook(() => useAuth());

    act(() => {
      result.current.login({ email: "test@example.com", password: "test" });
    });

    await waitFor(() => {
      expect(result.current.user).toEqual({ id: "1", email: "test@example.com" });
    });
  });
});
