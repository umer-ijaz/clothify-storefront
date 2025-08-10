"use client";
import React from "react";
import Image from "next/image";

interface TextBoxProps {
  text: string;
}

const TextBox: React.FC<TextBoxProps> = ({ text }) => {
  return (
    <div className="flex flex-row items-center -translate-x-7 relative">
      <div className="w-auto flex flex-row justify-center items-center pl-10 text-sm md:text-xl py-2 bg-[#ff0000] text-white rounded-full">
        <h1 className="text-right pr-5 subheading">{text}</h1>
      </div>
    </div>
  );
};

export default TextBox;
