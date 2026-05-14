export interface CraHealthSample {
	companyName: string;
}

export const CRA_HEALTH_SAMPLES: Record<string, CraHealthSample> = {
	AU: { companyName: "Commonwealth Bank of Australia" },
	CN: { companyName: "Tencent" },
	DE: { companyName: "Volkswagen AG" },
	FR: { companyName: "APPLE FRANCE" },
	GB: { companyName: "Standard Chartered" },
	HK: { companyName: "Fill Easy Limited" },
	ID: { companyName: "PT Astra International Tbk" },
	IN: { companyName: "INFOSYS LIMITED" },
	JP: { companyName: "Toyota Motor" },
	KH: { companyName: "ACLEDA Bank" },
	KR: { companyName: "Samsung Electronics" },
	MM: { companyName: "Myanmar Economic Bank" },
	MY: { companyName: "Petronas" },
	PH: { companyName: "Ayala Corporation" },
	SG: { companyName: "DBS Bank" },
	TH: { companyName: "PTT Public Company" },
	US: { companyName: "Apple" },
};

export function getHealthSample(countryCode: string): CraHealthSample | undefined {
	return CRA_HEALTH_SAMPLES[countryCode.toUpperCase()];
}
