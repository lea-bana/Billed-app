/**
 * @jest-environment jsdom
 *
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore);

Object.defineProperty(window, "localStorage", { value: localStorageMock });
window.localStorage.setItem(
  "user",
  JSON.stringify({
    type: "Employee",
    email: "a@a",
  })
);
document.body.innerHTML = '<div id="root"></div>';
router();

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then mail icon in vertical layout should be highlighted", () => {
      window.onNavigate(ROUTES_PATH.NewBill);
      const windowIcon = screen.getByTestId("icon-mail");
      expect(windowIcon.classList.contains("active-icon")).toBe(true);
    });
    test("Then form NewBill should appear", () => {
      window.onNavigate(ROUTES_PATH.NewBill);
      expect(screen.getAllByText("Envoyer une note de frais")).toBeTruthy();
      expect(screen.getByTestId("form-new-bill")).toBeTruthy();
    });
  });

  describe("When I am on a NewBill Page and I upload file with right extension (jpg|jpeg|png)", () => {
    test("Then my input file is valid", async () => {
      document.body.innerHTML = NewBillUI();
      const onNavigate = (pathname) => {
        document.body.innerHTML = pathname;
      };

      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      // Edit Input File
      const input = screen.getByTestId("file");
      const file = new File(["img"], "image.png", { type: "image/png" });
      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));
      input.addEventListener("change", handleChangeFile);
      userEvent.upload(input, file);

      expect(handleChangeFile).toHaveBeenCalled();
      expect(input.files[0].name).toMatch(/(\.jpg|\.jpeg|\.png)$/i);
    });
  });
  describe("When I am on NewBill Page and I upload file with wrong format", () => {
    test("Then my input file is invalid", async () => {
      localStorage.setItem(
        "user",
        JSON.stringify({ type: "Employee", email: "a@a" })
      );
      document.body.innerHTML = NewBillUI();
      const onNavigate = (pathname) => {
        document.body.innerHTML = pathname;
      };

      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      // Edit Input File
      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));
      const input = screen.getByTestId("file");
      const file = new File(["video"], "bill.mp4", { type: "video/mp4" });
      input.addEventListener("change", handleChangeFile);
      userEvent.upload(input, file);

      expect(handleChangeFile).toHaveBeenCalled();
      expect(input.files[0].name).not.toMatch(/(\.jpg|\.jpeg|\.png)$/i);
    });
  });
  describe("When I am on NewBill Page and I click on submit", () => {
    test("Then handlesubmit should be called", () => {
      document.body.innerHTML = NewBillUI();
      const onNavigate = (pathname) => {
        document.body.innerHTML = pathname;
      };
      const newBill = new NewBill({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });

      const handleSubmit = jest.fn(() => newBill.handleSubmit);
      const submitButton = document.getElementById("btn-send-bill"); //
      submitButton.addEventListener("click", handleSubmit);
      userEvent.click(submitButton);
      expect(handleSubmit).toHaveBeenCalled();
    });
  });
});

// test d'intégration
describe("Given I am connected as an employee", () => {
  describe("When I do fill fields in wrong format or do not fill fields and I click on submit button", () => {
    test("Then my input should be invalid", async () => {
      document.body.innerHTML = NewBillUI();
      const onNavigate = (pathname) => {
        document.body.innerHTML = pathname;
      };

      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      // Get DOMElements
      const inputType = screen.getByTestId("expense-type");
      const inputName = screen.getByTestId("expense-name");
      const inputDate = screen.getByTestId("datepicker");
      const inputAmount = screen.getByTestId("amount");
      const inputVAT = screen.getByTestId("vat");
      const inputPCT = screen.getByTestId("pct");
      const inputComment = screen.getByTestId("commentary");
      const inputFile = screen.getByTestId("file");
      const form = screen.getByTestId("form-new-bill");

      // Input datas
      const formData = {
        type: "0",
        name: "",
        date: "",
        amount: "ab",
        vat: 34,
        pct: "",
        file: new File(["img"], "test.jpg", { type: "image/jpg" }),
        commentary: "commentaire",
      };

      // Edit input
      fireEvent.change(inputType, { target: { value: formData.type } });
      fireEvent.change(inputName, { target: { value: formData.name } });
      fireEvent.change(inputDate, { target: { value: formData.date } });
      fireEvent.change(inputAmount, { target: { value: formData.amount } });
      fireEvent.change(inputVAT, { target: { value: formData.vat } });
      fireEvent.change(inputPCT, { target: { value: formData.pct } });
      fireEvent.change(inputComment, {
        target: { value: formData.commentary },
      });
      userEvent.upload(inputFile, formData.file);

      // Submit form
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);

      // Check if submit function called
      expect(handleSubmit).toHaveBeenCalled();
      expect(inputType.value).not.toBeTruthy();
      expect(inputName.value).not.toBeTruthy();
    });
  });

  describe("When I do fill fields in correct format and I click on submit button", () => {
    test("Then my inputs should be valid", () => {
      document.body.innerHTML = NewBillUI();

      // we have to mock navigation to test it
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      // Get DOMElements
      const inputType = screen.getByTestId("expense-type");
      const inputName = screen.getByTestId("expense-name");
      const inputDate = screen.getByTestId("datepicker");
      const inputAmount = screen.getByTestId("amount");
      const inputVat = screen.getByTestId("vat");
      const inputPct = screen.getByTestId("pct");
      const inputComment = screen.getByTestId("commentary");
      const form = screen.getByTestId("form-new-bill");
      const inputFile = screen.getByTestId("file");

      // Input datas
      const formData = {
        id: "BeKy5Mo4jkmdfPGYpTxZ",
        email: "a@a",
        type: "Transports",
        name: "nom",
        amount: "300",
        date: "2022-04-09",
        vat: 34,
        pct: 54,
        file: new File(["img"], "test.jpg", { type: "image/jpg" }),
        commentary: "commentaire",
      };

      // Edit input
      fireEvent.change(inputType, { target: { value: formData.type } });
      fireEvent.change(inputName, { target: { value: formData.name } });
      fireEvent.change(inputDate, { target: { value: formData.date } });
      fireEvent.change(inputAmount, { target: { value: formData.amount } });
      fireEvent.change(inputVat, { target: { value: formData.vat } });
      fireEvent.change(inputPct, { target: { value: formData.pct } });
      fireEvent.change(inputComment, {
        target: { value: formData.commentary },
      });
      userEvent.upload(inputFile, formData.file);

      // Submit form
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
      form.addEventListener("submit", handleSubmit);
      fireEvent.submit(form);

      // Check if submit function called
      expect(handleSubmit).toHaveBeenCalled();

      // Verify input validity
      expect(inputType.validity.valid).toBeTruthy();
      expect(inputName.validity.valid).toBeTruthy();
      expect(inputDate.validity.valid).toBeTruthy();
      expect(inputAmount.validity.valid).toBeTruthy();
      expect(inputVat.validity.valid).toBeTruthy();
      expect(inputPct.validity.valid).toBeTruthy();
      expect(inputComment.validity.valid).toBeTruthy();
      expect(inputFile.files[0]).toBeDefined();
    });

    test("Then newBill should be created", async () => {
      // use mockStore to simulate bill creation
      const updateBill = mockStore.bills().update();
      const addedBill = await updateBill.then((value) => {
        return value;
      });

      expect(addedBill.id).toEqual("47qAXb6fIm2zOKkLzMro");
      expect(addedBill.email).toEqual("a@a");
      expect(addedBill.amount).toEqual(400);
      expect(addedBill.fileUrl).toEqual(
        "https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a"
      );
    });

    test("Then It should renders Bills page", () => {
      expect(screen.getAllByText("Mes notes de frais"));
    });

    describe("When an error occurs on API", () => {
      test("Then fetch error 500 from API", async () => {
        jest.spyOn(mockStore, "bills");
        console.error = jest.fn();

        Object.defineProperty(window, "localStorage", {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          "user",
          JSON.stringify({ type: "Employee" })
        );
        document.body.innerHTML = `<div id="root"></div>`;
        router();
        window.onNavigate(ROUTES_PATH.NewBill);

        mockStore.bills.mockImplementationOnce(() => {
          return {
            update: () => {
              return Promise.reject(new Error("Erreur 500"));
            },
          };
        });
        const newBill = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage: window.localStorage,
        });

        // Submit form
        const form = screen.getByTestId("form-new-bill");
        const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
        form.addEventListener("submit", handleSubmit);

        fireEvent.submit(form);
        await new Promise(process.nextTick);
        expect(console.error).toBeCalled();
      });
    });
  });
});
