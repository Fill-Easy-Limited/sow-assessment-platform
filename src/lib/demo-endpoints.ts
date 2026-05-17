export type FieldType = "text" | "textarea" | "select" | "number" | "boolean";
export type FieldFormat = "json" | "comma-array" | "newline-array" | "comma-number-array";

export interface FieldDef {
	key: string;
	label: string;
	type: FieldType;
	required?: boolean;
	options?: string[];
	placeholder?: string;
	description?: string;
	format?: FieldFormat;
	/** Skip this field when "Fill Sample Values" is clicked */
	noSample?: boolean;
	/** Show this field only when another field has one of the given values */
	visibleWhen?: { field: string; values: string[] };
}

export interface EndpointDef {
	id: string;
	label: string;
	description: string;
	method: "GET" | "POST";
	path: string;
	pathParams?: string[];
	fields: FieldDef[];
	supportsBulk?: boolean;
	bulkSamples?: Record<string, string>[];
}

export interface ServiceDef {
	id: string;
	label: string;
	endpoints: EndpointDef[];
}

const IAM_SOURCES = [
	"PC_Browser",
	"android",
	"iOS",
	"Android_Chrome",
	"iOS_Safari",
	"Mobile_Browser",
];
const IAM_LANGS = ["en-US", "zh-HK", "zh-CN"];

export const SERVICES: ServiceDef[] = [
	{
		id: "kyc-china",
		label: "KYC China",
		endpoints: [],
	},
	{
		id: "sow",
		label: "SOW",
		endpoints: [],
	},
	{
		id: "corpverify",
		label: "CorpVerify",
		endpoints: [
			{
				id: "cra-info",
				label: "Info",
				description:
					"Browse all supported jurisdictions with their automation status, search capabilities, available document types, and sample reports. Use this to confirm coverage and identify the right document type before making a request.",
				method: "GET",
				path: "cra/info",
				fields: [
					{
						key: "country",
						label: "Country Code",
						type: "text",
						placeholder: "HK",
						description: "Optional ISO 3166 alpha-2 filter",
					},
				],
			},
			{
				id: "cra-search-companies",
				label: "Search Companies",
				supportsBulk: true,
				description: "Search a country's official company registry by name to find matching businesses and their company IDs. Returns company name, status, and registration details. Search behavior (partial, substring, or tokenized) varies by country.",
				method: "POST",
				path: "cra/{countryCode}/search/companies",
				pathParams: ["countryCode"],
				fields: [
					{
						key: "companyName",
						label: "Company Name",
						type: "text",
						required: true,
						placeholder: "HSBC",
					},
					{ key: "page", label: "Page", type: "number", placeholder: "1" },
				],
				bulkSamples: [
					{ companyName: "Acme Holdings Limited",          page: "1" },
					{ companyName: "Standard Chartered", page: "1" },
					{ companyName: "Hang Seng Bank",    page: "1" },
					{ companyName: "Fake Company", page: "1" },
					{ companyName: "Apple", page: "1" }
				],
			},
			{
				id: "cra-search-company",
				label: "Get Company Info",
				supportsBulk: true,
				description: "Look up a company's current registration details directly by its company ID — including name, status, incorporation date, and company type. Useful for confirming a company exists before requesting a full report.",
				method: "POST",
				path: "cra/{countryCode}/search/company",
				pathParams: ["countryCode"],
				fields: [
					{
						key: "companyId",
						label: "Company ID",
						type: "text",
						required: true,
						placeholder: "12104666",
					},
				],
				bulkSamples: [
					{ companyId: "12104666" },
					{ companyId: "76561250" },
					{ companyId: "C0069204" },
					{ companyId: "38598837" },
					{ companyId: "05218351" }
				],
			},
			{
				id: "cra-search-documents",
				label: "Search Documents",
				supportsBulk: true,
				description: "Browse documents on file for a company in the registry, grouped by category (Annual Returns, Director Changes, Charges, etc.). Returns filing dates and document IDs that can be passed directly to the report request endpoint.",
				method: "POST",
				path: "cra/{countryCode}/search/documents",
				pathParams: ["countryCode"],
				fields: [
					{
						key: "companyId",
						label: "Company ID",
						type: "text",
						required: true,
						placeholder: "12104666",
					},
					{
						key: "documentType",
						label: "Document Type",
						type: "text",
						placeholder: "annualReturn",
					},
					{ key: "documentYear", label: "Document Year", type: "text", placeholder: "2023" },
					{ key: "page", label: "Page", type: "number", placeholder: "1" },
				],
				bulkSamples: [
					{ companyId: "09748794", documentYear: "2023"},
					{ companyId: "12104666", documentType: "annualReturn", documentYear: "2024" },
					{ companyId: "C0069204"}
				],
			},
			{
				id: "cra-request",
				label: "Request Report",
				description:
					"Request an official company registry report. Providing a company ID enables automated retrieval — reports for supported countries typically complete within minutes. Company name can be used as a fallback and will be processed manually. Supports webhooks for async delivery.",
				method: "POST",
				path: "cra/request",
				fields: [
					{
						key: "countryCode",
						label: "Country Code",
						type: "text",
						required: true,
						placeholder: "HK",
					},
					{
						key: "companyId",
						label: "Company ID",
						type: "text",
						placeholder: "72599839",
						description: "BRN, ACN, etc. Preferred over company name.",
					},
					{
						key: "companyName",
						label: "Company Name",
						type: "text",
						placeholder: "Acme Holdings Limited",
						description: "Fallback if companyId unavailable",
					},
					{
						key: "documentType",
						label: "Document Type",
						type: "text",
						placeholder: "Company Particulars",
						description: "Defaults to the country's defaultDocumentType",
					},
					{ key: "documentYear", label: "Document Year", type: "text", placeholder: "2023", noSample: true,  },
					{
						key: "documentId",
						label: "Document ID",
						type: "text",
						description: "From /cra/{countryCode}/search/documents",
					},
					{
						key: "dryRun",
						label: "Dry Run",
						type: "boolean",
						description: "Test without incurring costs — returns a sample PDF",
					},
					{
						key: "callbackUrl",
						label: "Webhook URL",
						type: "text",
						placeholder: "https://yourapp.com/webhook",
						noSample: true,
					},
				],
			},
			{
				id: "cra-poll",
				label: "Poll Report",
				description:
					"Retrieve the completed company registry report. Returns structured data — registration details, directors, shareholders, share capital, and compliance records — along with presigned download links for original and translated documents. Poll until a 200 is returned.",
				method: "POST",
				path: "cra/poll",
				fields: [
					{
						key: "token",
						label: "Token",
						type: "text",
						required: true,
						description: "JWT from Request Report",
					},
				],
			}
		],
	},
	{
		id: "land-registry",
		label: "Land Registry",
		endpoints: [
			{
				id: "lra-search",
				label: "Search Address",
				supportsBulk: true,
				description:
					"Search Hong Kong Land Registry records by free-text address. Returns matching PRNs and formatted addresses. Note: this endpoint may take up to 25 seconds — if no match is found within that window, an empty candidate list is returned. This is expected as the feature is not currently designed to be used for real-time web applications - it is an internal tool within our pipeline.",
				method: "POST",
				path: "lra/search",
				fields: [
					{
						key: "address",
						label: "Address",
						type: "text",
						required: true,
						placeholder: "UNIT A ON 1/F CHEUNG LING MANSION NOS.162/164 CONNAUGHT ROAD WEST HONG KONG",
					},
				],
				bulkSamples: [
					{ address: "UNIT A ON 1/F CHEUNG LING MANSION NOS.162/164 CONNAUGHT ROAD WEST HONG KONG" },
					{ address: "HOUSE C4 HILLGROVE NO.18 CAPE DRIVE HONG KONG" },
					{ address: "FLAT G ON 69TH FLOOR OF TOWER 2 SORRENTO NO.1 AUSTIN ROAD WEST KOWLOON"}
				],
			},
			{
				id: "lra-request",
				label: "Request Report",
				description:
					"Request an official Hong Kong Land Registry document for a property. Providing a Property Reference Number (PRN) enables automated retrieval, typically within 5 minutes. Address-only requests are resolved manually within 1–2 business days. Supports webhooks for async delivery.",
				method: "POST",
				path: "lra/request",
				fields: [
					{ key: "countryCode", label: "Country Code", type: "text", placeholder: "HK" },
					{
						key: "prn",
						label: "Property Reference Number",
						type: "text",
						placeholder: "X1234567",
						description: "Preferred — enables automated retrieval",
					},
					{
						key: "address",
						label: "Address",
						type: "text",
						placeholder: "Flat A, 12/F, Block 1, Discovery Bay",
						description: "Manual fallback if PRN unavailable (1-2 days)",
					},
					{
						key: "dryRun",
						label: "Dry Run",
						type: "boolean",
						description: "Test without incurring costs",
					},
					{
						key: "callbackUrl",
						label: "Webhook URL",
						type: "text",
						placeholder: "https://yourapp.com/webhook",
						noSample: true,
					},
				],
			},
			{
				id: "lra-poll",
				label: "Poll Report",
				description:
					"Retrieve the completed Land Registry report. Returns a presigned download link to the official document. Poll until a 200 is returned.",
				method: "POST",
				path: "lra/poll",
				fields: [
					{
						key: "token",
						label: "Token",
						type: "text",
						required: true,
						placeholder: "eyJhbGci…",
						description: "JWT from Request Report",
					},
				],
			},
		],
	},
	{
		id: "iamsmart",
		label: "iAM Smart",
		endpoints: [
			{
				id: "iam-auth",
				label: "Authentication",
				description:
					"Initialize iAM Smart user authentication. Returns a token and a QR page URL (browser) or universal link (mobile).",
				method: "POST",
				path: "iamsmart/v2/request/auth",
				fields: [
					{
						key: "source",
						label: "Source",
						type: "select",
						required: true,
						options: IAM_SOURCES,
					},
					{ key: "lang", label: "Language", type: "select", options: IAM_LANGS },
					{
						key: "redirect",
						label: "Redirect URI",
						type: "text",
						required: true,
						placeholder: "https://yourapp.com/callback",
					},
					{
						key: "scope",
						label: "Scope",
						type: "text",
						placeholder: "eidapi_auth eidapi_formFilling",
					},
				],
			},
			{
				id: "iam-poll",
				label: "Poll Data",
				description:
					"Poll for results after user completes an iAM Smart flow. Data is deleted after the first successful poll.",
				method: "POST",
				path: "iamsmart/v2/callback/client",
				fields: [
					{
						key: "token",
						label: "Token",
						type: "text",
						required: true,
						placeholder: "eyJhbGci…",
						description: "Token from any iAM Smart initiation endpoint",
					},
					{
						key: "code",
						label: "Auth Code",
						type: "text",
						placeholder: "a51c81dc…",
						description: "Authorization code — required for App2App flow",
					},
				],
			},
			{
				id: "iam-formfilling",
				label: "Form Filling",
				description:
					"Request form filling data from an authenticated user. Requires a token from Authentication.",
				method: "POST",
				path: "iamsmart/v2/request/formfilling",
				fields: [
					{
						key: "token",
						label: "Auth Token",
						type: "text",
						required: true,
						placeholder: "eyJhbGci…",
						description: "Token from Authentication endpoint",
					},
					{
						key: "source",
						label: "Source",
						type: "select",
						required: true,
						options: IAM_SOURCES,
					},
					{
						key: "profileFields",
						label: "Profile Fields",
						type: "textarea",
						placeholder: "idNo, enName, chName, gender",
						description: "Comma-separated: idNo, enName, chName, birthDate, gender",
						format: "comma-array",
					},
					{
						key: "formData",
						label: "Form Data (JSON)",
						type: "textarea",
						placeholder:
							'{"formName":"My Form","formNum":"F001","formDesc":"...","formFields":["mobileNumber","emailAddress"]}',
						description: "formName, formNum, formDesc, formFields array",
						format: "json",
					},
				],
			},
			{
				id: "iam-signing",
				label: "Signing",
				description:
					"Request digital signature for a document hash. Requires a token from Authentication.",
				method: "POST",
				path: "iamsmart/v2/request/signing",
				fields: [
					{
						key: "token",
						label: "Auth Token",
						type: "text",
						required: true,
						placeholder: "eyJhbGci…",
					},
					{
						key: "source",
						label: "Source",
						type: "select",
						required: true,
						options: IAM_SOURCES,
					},
					{
						key: "name",
						label: "Document Name",
						type: "text",
						required: true,
						placeholder: "Sample Credit Card Application Form",
					},
					{
						key: "hash",
						label: "SHA-256 Hash",
						type: "text",
						required: true,
						placeholder: "af8b6f626242f214be360fa7d412e42dacb2f48bc11bb089019a912930019300",
						description: "64 hex characters",
					},
					{
						key: "service",
						label: "Service Description",
						type: "text",
						placeholder: "Digital Signing of Application Form",
					},
					{
						key: "organisation",
						label: "Organisation",
						type: "text",
						placeholder: "Acme Holdings Limited",
					},
				],
			},
			{
				id: "iam-pdf-signing",
				label: "PDF Signing",
				description:
					"Request PDF signing with embedded digital signature. Requires a token from Authentication.",
				method: "POST",
				path: "iamsmart/v2/request/pdf-signing",
				fields: [
					{
						key: "token",
						label: "Auth Token",
						type: "text",
						required: true,
						placeholder: "eyJhbGci…",
					},
					{
						key: "source",
						label: "Source",
						type: "select",
						required: true,
						options: IAM_SOURCES,
					},
					{
						key: "name",
						label: "Document Name",
						type: "text",
						required: true,
						placeholder: "Landsurvey Purchase Form",
					},
					{
						key: "fileHash",
						label: "File Hash (base64)",
						type: "textarea",
						required: true,
						placeholder: "R3fJTKFPwkRw019fLk+L19y91DVgI9hy/G7u6+YiECk=",
						description: "Base64-encoded hash of the PDF file",
					},
					{
						key: "service",
						label: "Service Description",
						type: "text",
						required: true,
						placeholder: "Digital PDF Signing Service",
					},
					{
						key: "hkicHash",
						label: "HKIC Hash",
						type: "text",
						description: "SHA-256 hash of HKIC for verification (optional)",
					},
					{ key: "department", label: "Department", type: "text", placeholder: "Legal Department" },
				],
			},
			{
				id: "iam-reauth",
				label: "Re-authentication",
				description:
					"Re-authenticate a previously authenticated user. Requires a token from Authentication.",
				method: "POST",
				path: "iamsmart/v2/request/reauth",
				fields: [
					{
						key: "token",
						label: "Auth Token",
						type: "text",
						required: true,
						placeholder: "eyJhbGci…",
					},
					{
						key: "source",
						label: "Source",
						type: "select",
						required: true,
						options: IAM_SOURCES,
					},
				],
			},
			{
				id: "iam-ccic",
				label: "CCIC",
				description: "CCIC verification request.",
				method: "POST",
				path: "iamsmart/v2/request/ccic",
				fields: [
					{
						key: "token",
						label: "Token",
						type: "text",
						required: true,
						placeholder: "eyJhbGci…",
					},
				],
			},
			{
				id: "iam-anon-formfilling",
				label: "Anonymous Form Filling",
				description:
					"Request form filling without prior authentication — combines auth and form filling in one step.",
				method: "POST",
				path: "iamsmart/v2/request/formfilling-anonymous",
				fields: [
					{
						key: "source",
						label: "Source",
						type: "select",
						required: true,
						options: IAM_SOURCES,
					},
					{ key: "lang", label: "Language", type: "select", options: IAM_LANGS },
					{
						key: "redirect",
						label: "Redirect URI",
						type: "text",
						required: true,
						placeholder: "https://yourapp.com/callback",
					},
					{
						key: "scope",
						label: "Scope",
						type: "text",
						placeholder: "eidapi_auth eidapi_formFilling",
					},
					{
						key: "profileFields",
						label: "Profile Fields",
						type: "textarea",
						placeholder: "idNo, enName, chName, gender",
						format: "comma-array",
					},
					{
						key: "formData",
						label: "Form Data (JSON)",
						type: "textarea",
						placeholder:
							'{"formName":"My Form","formNum":"F001","formDesc":"...","formFields":["mobileNumber","emailAddress"]}',
						format: "json",
					},
				],
			},
			{
				id: "iam-anon-signing",
				label: "Anonymous Hash Signing",
				description:
					"Request document signing without prior authentication — combines auth and signing in one step.",
				method: "POST",
				path: "iamsmart/v2/request/signing-anonymous",
				fields: [
					{
						key: "source",
						label: "Source",
						type: "select",
						required: true,
						options: IAM_SOURCES,
					},
					{ key: "lang", label: "Language", type: "select", options: IAM_LANGS },
					{
						key: "redirect",
						label: "Redirect URI",
						type: "text",
						required: true,
						placeholder: "https://yourapp.com/callback",
					},
					{
						key: "name",
						label: "Document Name",
						type: "text",
						required: true,
						placeholder: "Credit Card Application Form",
					},
					{
						key: "fileHash",
						label: "SHA-256 Hash",
						type: "text",
						required: true,
						placeholder: "af8b6f626242f214be360fa7d412e42dacb2f48bc11bb089019a912930019300",
					},
					{
						key: "service",
						label: "Service Description",
						type: "text",
						placeholder: "Digital Signing of Application Form",
					},
					{
						key: "hkicHash",
						label: "HKIC Hash",
						type: "text",
						description: "SHA-256 hash of HKIC for verification (optional)",
					},
					{
						key: "organisation",
						label: "Organisation",
						type: "text",
						placeholder: "Acme Holdings Limited",
					},
					{ key: "scope", label: "Scope", type: "text" },
				],
			},
			{
				id: "iam-anon-pdf-signing",
				label: "Anonymous PDF Signing",
				description:
					"Request PDF signing without prior authentication — combines auth and PDF signing in one step.",
				method: "POST",
				path: "iamsmart/v2/request/pdf-signing-anonymous",
				fields: [
					{
						key: "source",
						label: "Source",
						type: "select",
						required: true,
						options: IAM_SOURCES,
					},
					{ key: "lang", label: "Language", type: "select", options: IAM_LANGS },
					{
						key: "redirect",
						label: "Redirect URI",
						type: "text",
						required: true,
						placeholder: "https://yourapp.com/callback",
					},
					{
						key: "name",
						label: "Document Name",
						type: "text",
						required: true,
						placeholder: "PDF Document",
					},
					{
						key: "fileHash",
						label: "File Hash (base64)",
						type: "textarea",
						required: true,
						placeholder: "R3fJTKFPwkRw019fLk+L19y91DVgI9hy/G7u6+YiECk=",
						description: "Base64-encoded hash of the PDF file",
					},
					{
						key: "service",
						label: "Service Description",
						type: "text",
						required: true,
						placeholder: "Anonymous PDF Signing",
					},
					{
						key: "hkicHash",
						label: "HKIC Hash",
						type: "text",
						description: "SHA-256 hash of HKIC for verification (optional)",
					},
					{ key: "scope", label: "Scope", type: "text" },
				],
			},
		],
	},
	{
		id: "singpass",
		label: "Singpass",
		endpoints: [
			{
				id: "sgid-qr",
				label: "Verify (QR)",
				description:
					"Initialize a Singpass verification session. Returns a token and QR code URL.",
				method: "POST",
				path: "sgid/request/qr",
				fields: [
					{
						key: "redirect",
						label: "Redirect URI",
						type: "text",
						required: true,
						placeholder: "https://yourapp.com/callback",
					},
					{ key: "type", label: "QR Type", type: "select", options: ["dynamic", "static"] },
					{
						key: "responseFormat",
						label: "Response Format",
						type: "select",
						options: ["url", "qr", "both"],
					},
				],
			},
			{
				id: "sgid-myinfo",
				label: "MyInfo",
				description:
					"Initialize MyInfo personal data retrieval. Returns a URL to redirect the user to Singpass.",
				method: "POST",
				path: "sgid/request/auth",
				fields: [
					{
						key: "attributes",
						label: "Attributes",
						type: "textarea",
						required: true,
						placeholder: "openid, uinfin, name, mobileno",
						description: "Comma-separated Singpass attributes to request",
						format: "comma-array",
					},
					{
						key: "redirect",
						label: "Redirect URI",
						type: "text",
						required: true,
						placeholder: "https://yourapp.com/callback",
					},
				],
			},
			{
				id: "sgid-myinfo-biz",
				label: "MyInfo Business",
				description: "Initialize MyInfo Business corporate data retrieval.",
				method: "POST",
				path: "sgid/request/auth-biz",
				fields: [
					{
						key: "attributes",
						label: "Attributes",
						type: "textarea",
						required: true,
						placeholder: "name, basic-profile, financials, uinfin, capitals",
						description: "Comma-separated attributes",
						format: "comma-array",
					},
					{
						key: "redirect",
						label: "Redirect URI",
						type: "text",
						required: true,
						placeholder: "https://yourapp.com/callback",
					},
				],
			},
			{
				id: "sgid-poll",
				label: "Poll Data",
				description: "Poll for Singpass results after user authorizes the request.",
				method: "POST",
				path: "sgid/callback/client",
				fields: [
					{
						key: "token",
						label: "Token",
						type: "text",
						required: true,
						placeholder: "eyJhbGci…",
					},
				],
			},
		],
	},
	{
		id: "sino-connect",
		label: "Sino Connect",
		endpoints: [
			{
				id: "face-rec-request",
				label: "Face Recognition — Request",
				description:
					"Initialize a face recognition session. Returns a mobile browser URL and a token for polling.",
				method: "POST",
				path: "sino-connect/face-rec/request",
				fields: [
					{
						key: "redirect",
						label: "Redirect URI",
						type: "text",
						required: true,
						placeholder: "https://yourapp.com/callback",
					},
				],
			},
			{
				id: "face-rec-poll",
				label: "Face Recognition — Poll",
				description: "Poll for face recognition results after the user completes the H5 flow.",
				method: "POST",
				path: "sino-connect/face-rec/callback",
				fields: [
					{
						key: "token",
						label: "Token",
						type: "text",
						required: true,
						placeholder: "eyJhbGci…",
						description: "Token from Face Recognition Request",
					},
				],
			},
		],
	},
	{
		id: "uae-pass",
		label: "UAE Pass",
		endpoints: [
			{
				id: "uae-auth",
				label: "Authentication",
				description:
					"Initialize UAE Pass authentication. Returns a token and OAuth URL to redirect the user to.",
				method: "POST",
				path: "uaepass/request/auth",
				fields: [
					{
						key: "redirect",
						label: "Redirect URI",
						type: "text",
						required: true,
						placeholder: "https://yourapp.com/callback",
					},
					{
						key: "source",
						label: "Source",
						type: "select",
						required: true,
						options: ["PC_Browser", "android", "iOS", "Mobile_Browser"],
					},
					{ key: "lang", label: "Language", type: "select", options: ["en", "ar"] },
					{
						key: "scope",
						label: "Scope",
						type: "text",
						placeholder: "sub fullnameEN email mobile",
					},
				],
			},
			{
				id: "uae-poll",
				label: "Poll Data",
				description: "Poll for UAE Pass authentication or signing results.",
				method: "POST",
				path: "uaepass/poll",
				fields: [
					{
						key: "token",
						label: "Token",
						type: "text",
						required: true,
						placeholder: "eyJhbGci…",
					},
				],
			},
			{
				id: "uae-logout",
				label: "Logout",
				description: "Initialize UAE Pass logout. Returns a logout URL to redirect the user to.",
				method: "POST",
				path: "uaepass/logout",
				fields: [
					{
						key: "redirect",
						label: "Redirect URI",
						type: "text",
						required: true,
						placeholder: "https://yourapp.com/logged-out",
					},
				],
			},
		],
	},
	{
		id: "billing",
		label: "Billing",
		endpoints: [
			{
				id: "billing-items",
				label: "Get Billed Items",
				description: "Retrieve billed items for a given time range.",
				method: "GET",
				path: "core/billing",
				fields: [
					{
						key: "start",
						label: "Start (epoch seconds)",
						type: "number",
						required: true,
						placeholder: "1700000000",
					},
					{
						key: "end",
						label: "End (epoch seconds)",
						type: "number",
						required: true,
						placeholder: "1710000000",
					},
				],
			},
		],
	},
];
