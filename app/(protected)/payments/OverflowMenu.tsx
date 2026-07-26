"use client";

import { useEffect, useRef, useState } from "react";

type MenuItem = {
  label: string;
  icon?: string;
  onClick: () => void;
};

interface OverflowMenuProps {
  items: MenuItem[];
}

export default function OverflowMenu({
  items,
}: OverflowMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener(
        "click",
        handleClickOutside
      );
    };
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        className="rounded-md p-1 hover:bg-gray-100"
      >
        ⋮
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1 w-44 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xl z-50"
          onClick={(e) => e.stopPropagation()}
        >
          {items.map((item, index) => (
            <button
              key={index}
              type="button"
              onClick={() => {
                item.onClick();
                setOpen(false);
              }}
              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-gray-100"
            >
              {item.icon && <span>{item.icon}</span>}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}