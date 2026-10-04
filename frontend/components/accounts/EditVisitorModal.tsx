"use client";

import { useId, useState } from "react";
import type { FormEvent } from "react";
import { FormAlert } from "@/components/accounts/FormAlert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { apiPatch } from "@/lib/api";
import { EDUCATION_LEVELS } from "@/lib/accounts";
import type { EducationLevel, UpdateVisitorAccountRequest, VisitorAccount } from "@/types";

type Props = {
  account: VisitorAccount;
  onClose: () => void;
  /** Called after the server accepted the change. The parent reloads its list. */
  onSaved: () => void;
};

type Errors = Partial<Record<"name" | "domicile" | "institution", string>>;

/** Popup "Edit Akun Pengunjung". Mount it only while an account is being edited; it starts from `account`. */
export function EditVisitorModal({ account, onClose, onSaved }: Props) {
  const formId = useId();
  const [name, setName] = useState(account.name);
  const [domicile, setDomicile] = useState(account.domicile);
  const [institution, setInstitution] = useState(account.institution ?? "");
  const [educationLevel, setEducationLevel] = useState<EducationLevel>(account.educationLevel);
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function validate(): Errors {
    const found: Errors = {};
    if (!name.trim()) found.name = "Nama lengkap wajib diisi.";
    if (!domicile.trim()) found.domicile = "Domisili wajib diisi.";
    if (educationLevel !== "Umum" && !institution.trim()) {
      found.institution = "Asal sekolah / institusi wajib diisi untuk pelajar dan mahasiswa.";
    }
    return found;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    setServerError(null);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      const payload: UpdateVisitorAccountRequest = {
        name: name.trim(),
        domicile: domicile.trim(),
        institution: institution.trim() || null,
        educationLevel,
      };
      await apiPatch(`/api/accounts/visitors/${account.id}`, payload);
      onSaved();
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "Gagal menyimpan perubahan.");
      setSubmitting(false);
    }
  }

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
          <Button type="submit" form={formId} className="flex-1 p-[11px]!" disabled={submitting}>
            {submitting ? "Menyimpan…" : "Simpan Perubahan"}
          </Button>
        </>
      }
    >
      <form id={formId} noValidate onSubmit={handleSubmit}>
        <Input
          id={`${formId}-name`}
          label="Nama Lengkap"
          value={name}
          error={errors.name}
          autoFocus
          onChange={(event) => setName(event.target.value)}
        />
        <Input
          id={`${formId}-domicile`}
          label="Domisili"
          value={domicile}
          error={errors.domicile}
          onChange={(event) => setDomicile(event.target.value)}
        />
        <Input
          id={`${formId}-institution`}
          label="Asal Sekolah / Institusi"
          value={institution}
          error={errors.institution}
          placeholder={educationLevel === "Umum" ? "—" : undefined}
          onChange={(event) => setInstitution(event.target.value)}
        />
        <Select
          id={`${formId}-level`}
          label="Tingkat Pendidikan"
          value={educationLevel}
          onChange={(event) => setEducationLevel(event.target.value as EducationLevel)}
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
