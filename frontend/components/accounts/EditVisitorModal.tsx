"use client";

import { useId, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { FormAlert } from "@/components/accounts/FormAlert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { apiPatch } from "@/lib/api";
import { EDUCATION_LEVELS } from "@/lib/accounts";
import { editVisitorSchema, type EditVisitorFormValues } from "@/lib/validations/accounts";
import type { UpdateVisitorAccountRequest, VisitorAccount } from "@/types";

type Props = {
  account: VisitorAccount;
  onClose: () => void;
  /** Called after the server accepted the change. The parent reloads its list. */
  onSaved: () => void;
};

/** Popup "Edit Akun Pengunjung". Mount it only while an account is being edited; it starts from `account`. */
export function EditVisitorModal({ account, onClose, onSaved }: Props) {
  const formId = useId();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    control,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<EditVisitorFormValues>({
    resolver: zodResolver(editVisitorSchema),
    defaultValues: {
      name: account.name,
      domicile: account.domicile,
      institution: account.institution ?? "",
      educationLevel: account.educationLevel,
    },
  });
  const educationLevel = useWatch({ control, name: "educationLevel" });

  async function onSubmit(values: EditVisitorFormValues) {
    setServerError(null);
    try {
      const payload: UpdateVisitorAccountRequest = {
        name: values.name,
        domicile: values.domicile,
        institution: values.institution || null,
        educationLevel: values.educationLevel,
      };
      await apiPatch(`/api/accounts/visitors/${account.id}`, payload);
      onSaved();
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Gagal menyimpan perubahan.");
    }
  }

  const levelField = register("educationLevel");

  return (
    <Modal
      open
      onClose={onClose}
      title="Edit Akun Pengunjung"
      footer={
        <>
          <Button variant="outline" className="flex-1 p-[11px]!" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" form={formId} className="flex-1 p-[11px]!" disabled={isSubmitting}>
            {isSubmitting ? "Menyimpan…" : "Simpan Perubahan"}
          </Button>
        </>
      }
    >
      <form id={formId} noValidate onSubmit={handleSubmit(onSubmit)}>
        <Input
          id={`${formId}-name`}
          label="Nama Lengkap"
          error={errors.name?.message}
          autoFocus
          {...register("name")}
        />
        <Input id={`${formId}-domicile`} label="Domisili" error={errors.domicile?.message} {...register("domicile")} />
        <Input
          id={`${formId}-institution`}
          label="Asal Sekolah / Institusi"
          error={errors.institution?.message}
          placeholder={educationLevel === "Umum" ? "—" : undefined}
          {...register("institution")}
        />
        <Select
          id={`${formId}-level`}
          label="Tingkat Pendidikan"
          error={errors.educationLevel?.message}
          {...levelField}
          onChange={async (event) => {
            await levelField.onChange(event);
            // Re-check the institution right away so its error appears or clears.
            await trigger("institution");
          }}
        >
          {EDUCATION_LEVELS.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </Select>
        <FormAlert message={serverError} />
      </form>
    </Modal>
  );
}
