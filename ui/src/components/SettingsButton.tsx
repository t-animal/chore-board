import { useState } from "react";

import { useAuth } from "../contexts/AuthContext";
import style from "./SettingsButton.module.css";
import { SettingsDialog } from "./SettingsDialog";

export function SettingsButton() {
  const { isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);

  if (!isAuthenticated) return null;

  return (
    <>
      <button
        type="button"
        className={style["settings-fab"]}
        onClick={() => {
          setOpen(true);
        }}
      >
        Settings
      </button>
      <SettingsDialog
        open={open}
        onClose={() => {
          setOpen(false);
        }}
      />
    </>
  );
}
