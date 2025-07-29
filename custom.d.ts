declare module "js-cookie" {
  const Cookies: any;
  export default Cookies;
}

// PayPal Global Type Declaration
declare global {
  interface Window {
    paypal?: {
      Buttons: any;
      [key: string]: any;
    };
  }
}

export {};
