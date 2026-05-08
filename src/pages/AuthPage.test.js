import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AuthPage from "./AuthPage";

const mockLogin = jest.fn();
const mockRegister = jest.fn();
const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));
jest.mock("../context/AuthContext", () => ({
  useAuth: () => ({ login: mockLogin, register: mockRegister }),
}));
jest.mock("react-hot-toast", () => ({ success: jest.fn(), error: jest.fn() }));

describe("AuthPage - Login", () => {
  beforeEach(() => jest.clearAllMocks());

  test("renders login form", () => {
    render(
      <MemoryRouter>
        <AuthPage mode="login" />
      </MemoryRouter>,
    );
    expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/your_email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/••••/i)).toBeInTheDocument();
  });

  test("calls login on form submit", async () => {
    mockLogin.mockResolvedValue({});
    render(
      <MemoryRouter>
        <AuthPage mode="login" />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByPlaceholderText(/your_email/i), {
      target: { value: "user1" },
    });
    fireEvent.change(screen.getByPlaceholderText(/••••/i), {
      target: { value: "password" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: "user@gmail.com",
        password: "password",
      });
    });
  });

  test("shows loading state during login", async () => {
    mockLogin.mockImplementation(() => new Promise(() => {}));
    render(
      <MemoryRouter>
        <AuthPage mode="login" />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByPlaceholderText(/your_email/i), {
      target: { value: "user@gmail.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/••••/i), {
      target: { value: "pass1234" },
    });
    fireEvent.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() =>
      expect(screen.getByText(/Loading/i)).toBeInTheDocument(),
    );
  });
});

describe("AuthPage - Register", () => {
  test("renders register form with email field", () => {
    render(
      <MemoryRouter>
        <AuthPage mode="register" />
      </MemoryRouter>,
    );
    expect(screen.getByText(/Get started/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/you@example.com/i)).toBeInTheDocument();
  });

  test("calls register on submit", async () => {
    mockRegister.mockResolvedValue({});
    render(
      <MemoryRouter>
        <AuthPage mode="register" />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByPlaceholderText(/your_username/i), {
      target: { value: "newuser" },
    });
    fireEvent.change(screen.getByPlaceholderText(/you@example.com/i), {
      target: { value: "new@test.com" },
    });
    fireEvent.change(screen.getByPlaceholderText(/••••/i), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Create Account/i }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        username: "newuser",
        email: "new@test.com",
        password: "password123",
      });
    });
  });
});
