"use client";

import { ReactNode, useEffect, useState } from "react";

export function StartServiceWorker({ children }: { children: ReactNode }) {
	const [isMockReady, setMockReady] = useState(false);

	useEffect(() => {
		async function enableMocks() {
			if (process.env.NODE_ENV === "development") {
				const { worker } = await import("@/__tests__/mocks/browser");
				await worker.start();
			}
			setMockReady(true);
		}

		enableMocks();
	}, []);

	if (!isMockReady) {
		return <div>Loading mocks...</div>;
	}

	return <>{children}</>;
}
