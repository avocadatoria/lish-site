'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '../../../../lib/api-client.js';

export default function NewOrganizationPage() {
  const router = useRouter();
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.target);
    const body = {
      name: formData.get(`name`),
      slug: formData.get(`slug`),
      description: formData.get(`description`),
    };

    try {
      const org = await apiFetch(`/api/organizations`, {
        method: `POST`,
        body,
      });
      router.push(`/organizations/${org.slug}`);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main>
      <h1>Create Organization</h1>
      {error && <p style={{ color: `red` }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor={`name`}>Name</label>
          <input id={`name`} name={`name`} required />
        </div>
        <div>
          <label htmlFor={`slug`}>Slug</label>
          <input id={`slug`} name={`slug`} required pattern={`^[a-z0-9]+(?:-[a-z0-9]+)*$`} />
        </div>
        <div>
          <label htmlFor={`description`}>Description</label>
          <textarea id={`description`} name={`description`} />
        </div>
        <button type={`submit`}>Create</button>
      </form>
    </main>
  );
}
