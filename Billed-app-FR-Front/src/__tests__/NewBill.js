/**
 * @jest-environment jsdom
 *
 */
import "@testing-library/jest-dom";
import { screen, waitFor, getByTestId, fireEvent } from "@testing-library/dom";

import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { bills } from "../fixtures/bills";
import mockStore from "../__mocks__/store.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then the upload file extension should be in a right format", () => {
      const html = NewBillUI();
      document.body.innerHTML = html;
      mockStore.bills = jest.fn().mockImplementation(() => {
        return {
          create: () => {
            return Promise.resolve({});
          },
        };
      });
      const onNavigate = (pathname) => {
        document.body.innerHTML = pathname;
      };
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        bills,
        localStorage: window.localStorage,
      });
      const handleChangeFile = jest.fn(newBill.handleChangeFile);
      const inputFile = screen.getByTestId("file");
      inputFile.addEventListener("change", handleChangeFile);
      fireEvent.change(inputFile, {
        target: {
          files: [new File(["file.jpg"], "file.jpg", { type: "file/jpg" })],
        },
      });
    });
  });
});
