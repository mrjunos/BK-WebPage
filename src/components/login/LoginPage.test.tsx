import "../../test/firebaseMock"; // Must be imported first to register mocks!
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, test, expect, vi, beforeEach } from "vitest";
import LoginPage from "./LoginPage";
import {
  mockSignInWithEmailAndPassword,
  mockCreateUserWithEmailAndPassword,
  mockSignInWithPopup,
  mockSignOut
} from "../../test/firebaseMock";

describe("LoginPage UI & Authentication Tests", () => {
  const defaultProps = {
    onLoginSuccess: vi.fn(),
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  test("renders standard login inputs, brand title, and Google Workspace button", () => {
    render(<LoginPage {...defaultProps} />);

    // Brand and structural tags
    expect(screen.getByText("Bienvenido de vuelta")).toBeInTheDocument();
    expect(screen.getByText(/Acceda con sus credenciales/i)).toBeInTheDocument();

    // Field labels and placeholders
    expect(screen.getByText("Correo Electrónico")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("usted@beethovenkaffee.co")).toBeInTheDocument();
    expect(screen.getByText("Contraseña")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("••••••••••••")).toBeInTheDocument();

    // Standard & Google buttons
    expect(screen.getByRole("button", { name: /Iniciar Sesión/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Google Workspace/i })).toBeInTheDocument();
  });

  test("validates empty inputs and displays error message", async () => {
    render(<LoginPage {...defaultProps} />);

    const submitBtn = screen.getByRole("button", { name: /Iniciar Sesión/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText("Ingrese su correo y contraseña.")).toBeInTheDocument();
    expect(defaultProps.onLoginSuccess).not.toHaveBeenCalled();
  });

  test("successful standard sign-in calls onLoginSuccess", async () => {
    mockSignInWithEmailAndPassword.mockResolvedValueOnce({
      user: { email: "admin@bk.co" }
    });

    render(<LoginPage {...defaultProps} />);

    const emailInput = screen.getByPlaceholderText("usted@beethovenkaffee.co");
    const passInput = screen.getByPlaceholderText("••••••••••••");
    const submitBtn = screen.getByRole("button", { name: /Iniciar Sesión/i });

    fireEvent.change(emailInput, { target: { value: "admin@bk.co" } });
    fireEvent.change(passInput, { target: { value: "secret123" } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockSignInWithEmailAndPassword).toHaveBeenCalledWith(
        expect.anything(),
        "admin@bk.co",
        "secret123"
      );
      expect(defaultProps.onLoginSuccess).toHaveBeenCalled();
    });
  });

  test("successful Google Sign-in with whitelisted email jjcadu@gmail.com calls onLoginSuccess", async () => {
    mockSignInWithPopup.mockResolvedValueOnce({
      user: { email: "jjcadu@gmail.com" }
    });

    render(<LoginPage {...defaultProps} />);

    const googleBtn = screen.getByRole("button", { name: /Google Workspace/i });
    fireEvent.click(googleBtn);

    await waitFor(() => {
      expect(mockSignInWithPopup).toHaveBeenCalled();
      expect(defaultProps.onLoginSuccess).toHaveBeenCalled();
      expect(mockSignOut).not.toHaveBeenCalled();
    });
  });

  test("rejected Google Sign-in with non-whitelisted email calls signOut and displays error", async () => {
    mockSignInWithPopup.mockResolvedValueOnce({
      user: { email: "extraneo@gmail.com" }
    });

    render(<LoginPage {...defaultProps} />);

    const googleBtn = screen.getByRole("button", { name: /Google Workspace/i });
    fireEvent.click(googleBtn);

    await waitFor(() => {
      expect(mockSignInWithPopup).toHaveBeenCalled();
      expect(mockSignOut).toHaveBeenCalled();
      expect(defaultProps.onLoginSuccess).not.toHaveBeenCalled();
    });

    expect(
      screen.getByText("Este correo electrónico de Google no está autorizado como administrador de Beethoven Kaffee.")
    ).toBeInTheDocument();
  });
});
