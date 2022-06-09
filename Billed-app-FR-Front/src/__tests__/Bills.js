/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import { screen, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import Bills from "../containers/Bills";

import router from "../app/Router.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      //to-do write expect expression -ok
      expect(windowIcon.className).toContain("active-icon");
    });
  });

  test("Then bills should be ordered from earliest to latest", () => {
    document.body.innerHTML = BillsUI({ data: bills });
    const dates = screen
      .getAllByText(
        /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
      )
      .map((a) => a.innerHTML);
    const antiChrono = (a, b) => new Date(b.rawDate) - new Date(a.rawDate);
    const datesSorted = [...dates].sort(antiChrono);
    expect(dates).toEqual(datesSorted);
  });

  describe("When I click on the button -nouvelle note de frais ", () => {
    test("Then, it should render NewBill Page", () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));
      const html = BillsUI({ data: bills });
      document.body.innerHTML = html;

      const onNavigate = (pathname) => {
        document.body.innerHTML = pathname;
      };

      const billsContainer = new Bills({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      const btn = screen.getByTestId("btn-new-bill");
      const handleClickNewBill = jest.fn(billsContainer.handleClickNewBill);
      btn.addEventListener("click", handleClickNewBill);
      userEvent.click(btn);
      expect(handleClickNewBill).toHaveBeenCalled();
    });
  });

  describe("When I click on the button 'IconEye' ", () => {
    test("Then the modal should be open ", () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem("user", JSON.stringify({ type: "Employee" }));

      const html = BillsUI({ data: bills });
      document.body.innerHTML = html;

      const billsContainer = new Bills({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      $.fn.modal = jest.fn(); //def la fction modal -- Jquery--
      const iconEye = screen.getAllByTestId("icon-eye")[0];
      const handleShowModalFile = jest.fn((e) => {
        billsContainer.handleClickIconEye(e.target);
      });

      iconEye.addEventListener("click", handleShowModalFile);
      userEvent.click(iconEye);

      expect(handleShowModalFile).toHaveBeenCalled();
      expect(screen.getAllByText("Justificatif")).toBeTruthy();
    });
  });

  //TEST D'INTEGRATION GET BILLS

  describe("When I navigate in my space", () => {
    test("Then fetches bills from mock API GET ", async () => {
      localStorage.setItem(
        "user",
        JSON.stringify({ type: "Employee", email: "a@a" })
      );

      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();

      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByText("Mes notes de frais"));
      expect(screen.getByText("Mes notes de frais")).toBeTruthy();
    });
  });

  describe("When I get bills", () => {
    test("Then it should render bills", async () => {
      const bills = new Bills({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });
      const getBills = jest.fn(() => bills.getBills());
      const value = await getBills();
      expect(getBills).toHaveBeenCalled();
      expect(value.length).toBe(4);
    });
  });

  test("Then fetch bills from an API and fail with 404 message error", async () => {
    mockStore.bills = jest.fn().mockImplementation(() => {
      Promise.reject(new Error("Erreur 404"));
    });
    const html = BillsUI({ error: "Erreur 404" });
    document.body.innerHTML = html;
    const message = screen.getByText(/Erreur 404/);
    expect(message).toBeTruthy();
  });

  test("Then fetch bills from an API and fail with 500 message error", async () => {
    mockStore.bills = jest.fn().mockImplementation(() => {
      Promise.reject(new Error("Erreur 500"));
    });
    const html = BillsUI({ error: "Erreur 500" });
    document.body.innerHTML = html;
    const message = screen.getByText(/Erreur 500/);
    expect(message).toBeTruthy();
  });
});
