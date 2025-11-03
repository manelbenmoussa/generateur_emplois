"use client";
import React, { ReactNode } from "react";
import Sidebar from "@/components/Sidebar";

interface Props {
  title: string;
  children: ReactNode;
}

export default function TwoColumnLayout({ title, children }: Props) {
  return (
    <div className="min-h-screen flex">
      <Sidebar title={title} />

      <main className="w-3/4 p-6 bg-white">{children}</main>
    </div>
  );
}
