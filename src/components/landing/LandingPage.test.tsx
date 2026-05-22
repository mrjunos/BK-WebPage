import "../../test/firebaseMock"; // Must be imported first to register mocks!
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, test, expect, vi } from "vitest";
import LandingPage from "./LandingPage";
import { mockHero, mockChapters, mockNotes, mockProducts } from "../../test/firebaseMock";

describe("LandingPage UI Tests", () => {
  const defaultProps = {
    onNavigate: vi.fn(),
    isAdminLoggedIn: false,
  };

  test("renders Hero Section with high-fidelity titles and descriptors", () => {
    render(<LandingPage {...defaultProps} />);

    // Verify Title
    expect(screen.getByText(mockHero.title_main)).toBeInTheDocument();
    expect(screen.getByText(mockHero.title_accent)).toBeInTheDocument();

    // Verify Subtitle/Description
    expect(screen.getByText(mockHero.subline)).toBeInTheDocument();

    // Verify Metadata values (using regex because text may be concatenated or split across spans)
    expect(screen.getAllByText(/1\.800/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/La Florida/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Nariño/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Lavado/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/84/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/SCA/i).length).toBeGreaterThan(0);
  });

  test("renders all 6 Chapters of the bean-to-cup process", () => {
    render(<LandingPage {...defaultProps} />);

    mockChapters.forEach((ch) => {
      // Each chapter heading contains the title
      expect(screen.getByText(ch.title)).toBeInTheDocument();
      // Body content is rendered
      expect(screen.getByText(ch.body)).toBeInTheDocument();
      // Step number label is rendered (LandingPage splits at "—" and renders only the prefix)
      const stepNumPrefix = ch.step?.split("—")[0].trim();
      expect(screen.getByText(stepNumPrefix)).toBeInTheDocument();
    });
  });

  test("renders tasting notes and SCA Radar Chart correctly", () => {
    render(<LandingPage {...defaultProps} />);

    // Tasting note names should be visible
    mockNotes.forEach((note) => {
      expect(screen.getByText(note.name)).toBeInTheDocument();
      expect(screen.getByText(note.sub)).toBeInTheDocument();
    });

    // The SVG Radar polygon should be in the DOM
    const polygon = document.querySelector("svg polygon");
    expect(polygon).toBeInTheDocument();
    expect(polygon).toHaveAttribute("points");
  });

  test("renders active coffee catalog with correct prices and WhatsApp order links", () => {
    render(<LandingPage {...defaultProps} />);

    const publishedProducts = mockProducts.filter((p) => p.status === "published");

    publishedProducts.forEach((p) => {
      expect(screen.getByText(p.name)).toBeInTheDocument();
      expect(screen.getByText(p.description)).toBeInTheDocument();
      
      // COP Format Price check
      const formattedPrice = `$${p.price.toLocaleString("es-CO")}`;
      expect(screen.getByText(new RegExp(formattedPrice.replace("$", "\\$")))).toBeInTheDocument();
    });

    // Draft products should not be rendered in the catalog
    const draftProducts = mockProducts.filter((p) => p.status === "draft");
    draftProducts.forEach((p) => {
      expect(screen.queryByText(p.name)).not.toBeInTheDocument();
    });

    // Pedir button elements should have correct target and rel attributes
    const orderLinks = screen.getAllByRole("link", { name: /Pedir/i });
    expect(orderLinks.length).toBeGreaterThan(0);
    orderLinks.forEach((link) => {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noreferrer");
      expect(link.getAttribute("href")).toContain("wa.me");
    });
  });

  test("navigates to login screen when clicking the header Acceso button", () => {
    render(<LandingPage {...defaultProps} />);

    const accesoBtn = screen.getByRole("button", { name: /Acceso/i });
    expect(accesoBtn).toBeInTheDocument();

    fireEvent.click(accesoBtn);
    expect(defaultProps.onNavigate).toHaveBeenCalledWith("/login");
  });

  test("navigates to dashboard directly when clicking the admin Panel button if already logged in", () => {
    const propsWithAdmin = {
      ...defaultProps,
      isAdminLoggedIn: true,
      onNavigate: vi.fn(),
    };
    render(<LandingPage {...propsWithAdmin} />);

    const panelBtn = screen.getByRole("button", { name: /Panel/i });
    expect(panelBtn).toBeInTheDocument();

    fireEvent.click(panelBtn);
    expect(propsWithAdmin.onNavigate).toHaveBeenCalledWith("/admin");
  });
});
