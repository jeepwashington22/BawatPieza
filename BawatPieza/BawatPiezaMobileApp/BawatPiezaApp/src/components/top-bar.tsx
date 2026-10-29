      if (action === 'accept') {
        try {
          const sharedAccounts = await apiFetch('/accounts?shared=1', {
          headers: { Authorization: `Bearer ${token}` },
          timeoutMs: 8_000,
        });
        const sharedJson = (await sharedAccounts.json().catch(() => null)) as {
          accounts?: Array<{ hub_id?: string | null }>;
        } | null;
        const hubId = sharedJson?.accounts?.find((account) => account.hub_id)?.hub_id;
          if (hubId) await AsyncStorage.setItem('bawatpieza_hub_id', hubId);
          // Persist shared-access locally so the device gate lets this
          // account in even without its own paired hub.
          try {
            await AsyncStorage.setItem('bawatpieza_shared_access', '1');
          } catch {
            // ignore
          }
        } catch {
          // Access is already granted; hub discovery can retry on the next screen.
        }
      }