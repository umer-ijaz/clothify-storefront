"use client";

import type React from "react";
import { useState } from "react";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@/context/userContext";
import { AuthModal } from "@/components/auth-modal";
import emailjs from "emailjs-com";

export default function ContactForm() {
  const [modal, setModal] = useState(false);
  const { user } = useUser();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setModal(true);
      toast.error("Benutzer muss angemeldet sein, um Kontakt aufzunehmen.");
      return;
    }

    const { firstName, lastName, phoneNumber, email, message } = formData;
    const fullName = `${firstName} ${lastName}`;
    const currentTime = new Date().toLocaleString();

    const templateParams = {
      name: fullName,
      message: `${message}\n\n📞 Phone: ${phoneNumber}\n📧 Email: ${email}`,
      time: currentTime,
      title: `Contact Form Submission from ${fullName}`,
    };

    try {
      await emailjs.send(
        process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
        process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
        templateParams,
        process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!
      );

      toast.success("Nachricht wurde erfolgreich gesendet.");
      setFormData({
        firstName: "",
        lastName: "",
        phoneNumber: "",
        email: "",
        message: "",
      });
    } catch (error) {
      console.error("EmailJS Error:", error);
      toast.error(
        "Nachricht konnte nicht gesendet werden. Bitte versuchen Sie es später erneut."
      );

    }
  };

  return (
    <div className="w-full rounded-xl bg-white p-6 shadow-lg">
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col md:flex-row md:gap-6">
          <div className="flex-1 space-y-4">
            {/* First Name */}
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-bold text-gray-700"
              >
                Vorname*
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                placeholder="Hier schreiben"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="mt-1 w-full rounded-full border border-gray-300 bg-white px-4 py-2 text-sm focus:border-red-500 focus:ring-0 focus:ring-red-400 focus:border-none"
              />
            </div>

            {/* Last Name */}
            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-bold text-gray-700 heading"
              >
                Nachname*
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                placeholder="Hier schreiben"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="mt-1 w-full rounded-full border border-gray-300 bg-white px-4 py-2 text-sm focus:border-red-500 focus:ring-0 focus:ring-red-400 focus:border-none"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label
                htmlFor="phoneNumber"
                className="block text-sm font-bold text-gray-700 heading"
              >
                Telefonnummer
              </label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                placeholder="Hier schreiben"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="mt-1 w-full rounded-full border border-gray-300 bg-white px-4 py-2 text-sm focus:border-red-500 focus:ring-0 focus:ring-red-400 focus:border-none"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-bold text-gray-700 heading"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Hier schreiben"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 w-full rounded-full border border-gray-300 bg-white px-4 py-2 text-sm focus:border-red-500 focus:ring-0 focus:ring-red-400 focus:border-none"
              />
            </div>
          </div>

          {/* Message Textarea */}
          <div className="mt-4 flex-1 md:mt-0">
            <label
              htmlFor="message"
              className="block text-sm font-bold text-gray-700 heading"
            >
              Nachricht
            </label>
            <textarea
              id="message"
              name="message"
              placeholder="Write HereHier schreiben"
              value={formData.message}
              onChange={handleChange}
              rows={7}
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm focus:border-red-500 focus:ring-0 focus:ring-red-400 focus:border-none"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="mt-10 flex justify-center">
          <button
            type="submit"
            className="flex items-center gap-1 rounded-full bg-gradient-to-r from-[#EB1E24] via-[#F05021] to-[#F8A51B] px-5 py-2 text-sm font-medium text-white transition-all duration-500 ease-out transform hover:shadow-xl cursor-pointer hover:bg-right hover:from-[#EB1E24] hover:via-[#F05021] hover:to-[#ff3604]"
          >
            <Send className="h-4 w-4" />
            Senden
          </button>
        </div>
      </form>

      {/* Modal */}
      <AuthModal isOpen={modal} onClose={() => setModal(false)} />
    </div>
  );
}
