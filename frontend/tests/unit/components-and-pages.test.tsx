import { render, screen } from "@testing-library/react";
import { Button } from "@/components/ui/button";
import { DashboardHeader } from "@/app/(protected)/dashboard/_components/dashboard-header";
import { SummaryCards } from "@/app/(protected)/dashboard/_components/summary-cards";
import Home from "@/app/page";
import LoginPage from "@/app/(auth)/login/page";

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

jest.mock("@/app/(auth)/_components/LoginForm", () => ({
  LoginForm: () => <div data-testid="login-form">Mock Login Form</div>,
}));

describe("Frontend unit components and pages", () => {
  it("renders button with configured variant and size", () => {
    render(
      <Button variant="secondary" size="sm">
        Save
      </Button>,
    );

    const button = screen.getByRole("button", { name: "Save" });
    expect(button).toHaveAttribute("data-variant", "secondary");
    expect(button).toHaveAttribute("data-size", "sm");
  });

  it("renders dashboard header with greeting and subtitle", () => {
    render(<DashboardHeader greeting="Good morning" firstName="Alex" />);

    expect(screen.getByText("Good morning, Alex")).toBeInTheDocument();
    expect(screen.getByText("Here's your health overview for today")).toBeInTheDocument();
  });

  it("renders summary cards through stat grid", () => {
    render(
      <SummaryCards
        cards={[
          { title: "Records", value: "12", note: "+2 this week" } as any,
          { title: "Vitals", value: "8", note: "Stable" } as any,
        ]}
      />,
    );

    expect(screen.getByText("Records")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("+2 this week")).toBeInTheDocument();
    expect(screen.getByText("Vitals")).toBeInTheDocument();
  });

  it("renders landing page and login navigation", () => {
    render(<Home />);

    expect(
      screen.getByText("Transforming Personal Healthcare Through Intelligent Insights"),
    ).toBeInTheDocument();
    const loginLinks = screen.getAllByRole("link", { name: /log in/i });
    expect(loginLinks.length).toBeGreaterThan(0);
    expect(loginLinks[0]).toHaveAttribute("href", "/login");
  });

  it("renders login page heading and login form", () => {
    render(<LoginPage />);

    expect(screen.getByText("Welcome Back!")).toBeInTheDocument();
    expect(
      screen.getByText("Enter your email and password to access your account"),
    ).toBeInTheDocument();
    expect(screen.getByTestId("login-form")).toBeInTheDocument();
  });
});
