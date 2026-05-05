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
		endpoints: [
			{
				id: "identity",
				label: "Verify Identity",
				supportsBulk: true,
				description:
					"Verify a person's identity using government records and/or telecom registration data.",
				method: "POST",
				path: "kyc/cn/identity",
				fields: [
					{
						key: "type",
						label: "Verification Type",
						type: "select",
						required: true,
						options: [
							"two-factor",
							"four-factor",
							"image",
							"name-mobile",
							"id-mobile",
							"three-factor",
						],
					},
					{
						key: "name",
						label: "Full Name (Chinese)",
						type: "text",
						placeholder: "李明",
						visibleWhen: { field: "type", values: ["two-factor", "four-factor", "image", "name-mobile", "three-factor"] },
					},
					{
						key: "idNo",
						label: "ID Number",
						type: "text",
						placeholder: "110101199003076515",
						visibleWhen: { field: "type", values: ["two-factor", "four-factor", "image", "id-mobile", "three-factor"] },
					},
					{
						key: "mobile",
						label: "Mobile Number",
						type: "text",
						placeholder: "13912345678",
						visibleWhen: { field: "type", values: ["name-mobile", "id-mobile", "three-factor"] },
					},
					{
						key: "frDate",
						label: "ID Issue Date",
						type: "text",
						placeholder: "20200315",
						description: "YYYYMMDD",
						visibleWhen: { field: "type", values: ["four-factor"] },
					},
					{
						key: "toDate",
						label: "ID Expiry Date",
						type: "text",
						placeholder: "20400315",
						description: "YYYYMMDD or 长期",
						visibleWhen: { field: "type", values: ["four-factor"] },
					},
					{
						key: "img",
						label: "Face Photo (base64)",
						type: "textarea",
						placeholder: "iVBORw0KGgo…",
						description: "Base64-encoded JPEG/PNG",
						visibleWhen: { field: "type", values: ["image"] },
					},
				],
				bulkSamples: [
					{ type: "two-factor",   name: "李明", idNo: "110101199003076515", mobile: "",            frDate: "",         toDate: "",         img: "" },
					{ type: "name-mobile",  name: "张伟", idNo: "",                   mobile: "13912345678", frDate: "",         toDate: "",         img: "" },
					{ type: "id-mobile",    name: "",     idNo: "110101199003076515", mobile: "13912345678", frDate: "",         toDate: "",         img: "" },
					{ type: "three-factor", name: "李明", idNo: "110101199003076515", mobile: "13912345678", frDate: "",         toDate: "",         img: "" },
					{ type: "four-factor",  name: "李明", idNo: "110101199003076515", mobile: "",            frDate: "20200315", toDate: "20400315", img: "" },
				],
			},
			{
				id: "mobile",
				label: "Mobile Lookup",
				supportsBulk: true,
				description:
					"Non-identity lookups on a mobile number — carrier info and geolocation.",
				method: "POST",
				path: "kyc/cn/mobile",
				fields: [
					{
						key: "type",
						label: "Lookup Type",
						type: "select",
						required: true,
						options: ["attribution", "location-verify", "location-query"],
					},
					{
						key: "mobile",
						label: "Mobile Number",
						type: "text",
						required: true,
						placeholder: "13912345678",
					},
					{
						key: "locationType",
						label: "Location Type",
						type: "select",
						options: ["1", "2", "3"],
						description: "1=Common, 2=Work (7–19 weekdays), 3=Residential (21–7)",
						visibleWhen: { field: "type", values: ["location-verify", "location-query"] },
					},
					{
						key: "city",
						label: "City (Chinese)",
						type: "text",
						placeholder: "北京",
						visibleWhen: { field: "type", values: ["location-verify"] },
					},
					{
						key: "address",
						label: "Address (Chinese)",
						type: "text",
						placeholder: "朝阳区建国路88号",
						visibleWhen: { field: "type", values: ["location-verify"] },
					},
				],
				bulkSamples: [
					{ type: "attribution",     mobile: "13912345678", locationType: "",  city: "",   address: "" },
					{ type: "location-verify", mobile: "13912345678", locationType: "1", city: "北京", address: "朝阳区建国路88号" },
					{ type: "location-query",  mobile: "13912345678", locationType: "2", city: "",   address: "" },
				],
			},
			{
				id: "risk",
				label: "Risk Assessment",
				supportsBulk: true,
				description: "Fraud risk scoring and criminal record checks.",
				method: "POST",
				path: "kyc/cn/risk",
				fields: [
					{
						key: "type",
						label: "Check Type",
						type: "select",
						required: true,
						options: ["fraud-risk", "criminal-record"],
					},
					{
						key: "mobile",
						label: "Mobile Number",
						type: "text",
						placeholder: "13912345678",
						visibleWhen: { field: "type", values: ["fraud-risk"] },
					},
					{
						key: "idNo",
						label: "ID Number",
						type: "text",
						placeholder: "110101199003076515",
						description: "Optional for fraud-risk",
						visibleWhen: { field: "type", values: ["fraud-risk", "criminal-record"] },
					},
					{
						key: "name",
						label: "Full Name (Chinese)",
						type: "text",
						placeholder: "李明",
						visibleWhen: { field: "type", values: ["criminal-record"] },
					},
				],
				bulkSamples: [
					{ type: "fraud-risk",      mobile: "13912345678", idNo: "110101199003076515", name: "" },
					{ type: "criminal-record", mobile: "",            idNo: "110101199003076515", name: "李明" },
				],
			},
			{
				id: "bank-verification",
				label: "Bank Card Verification",
				supportsBulk: true,
				description:
					"Verify a bank card belongs to a specific person using three or four-factor verification.",
				method: "POST",
				path: "kyc/cn/bank-verification",
				fields: [
					{
						key: "type",
						label: "Verification Type",
						type: "select",
						required: true,
						options: ["three-factor", "four-factor"],
					},
					{
						key: "name",
						label: "Full Name (Chinese)",
						type: "text",
						required: true,
						placeholder: "李明",
					},
					{
						key: "idNo",
						label: "ID Number",
						type: "text",
						required: true,
						placeholder: "110101199003076515",
					},
					{
						key: "bankCard",
						label: "Bank Card Number",
						type: "text",
						required: true,
						placeholder: "6217001180041276133",
					},
					{
						key: "mobile",
						label: "Mobile Number",
						type: "text",
						placeholder: "13912345678",
						visibleWhen: { field: "type", values: ["four-factor"] },
					},
				],
				bulkSamples: [
					{ type: "three-factor", name: "李明", idNo: "110101199003076515", bankCard: "6217001180041276133", mobile: "" },
					{ type: "four-factor",  name: "李明", idNo: "110101199003076515", bankCard: "6217001180041276133", mobile: "13912345678" },
				],
			},
		],
	},
	{
		id: "corpverify",
		label: "CorpVerify",
		endpoints: [
			{
				id: "cra-info",
				label: "Info",
				description:
					"Returns all supported countries with their capabilities and available document types.",
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
				description: "Search for companies by name in a country's registry.",
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
					{ companyName: "Fill Easy Limited",             page: "1" },
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
				description: "Retrieve base information for a specific company by its ID.",
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
				description: "Search for documents filed by a company in a country's registry.",
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
					"Initiate a company registry report request. Returns a token to poll with.",
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
						placeholder: "Fill Easy Limited",
						description: "Fallback if companyId unavailable",
					},
					{
						key: "documentType",
						label: "Document Type",
						type: "text",
						placeholder: "Company Particulars",
						description: "Defaults to the country's defaultDocumentType",
					},
					{ key: "documentYear", label: "Document Year", type: "text", placeholder: "2023", noSample: true },
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
					"Check status of a company registry report. Poll until 200 is returned.",
				method: "POST",
				path: "cra/poll",
				fields: [
					{
						key: "token",
						label: "Token",
						type: "text",
						required: true,
						description: "JWT from /cra/request",
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
					"Search Hong Kong Land Registry address records. Returns up to 300 matching records.",
				method: "POST",
				path: "lra/search",
				fields: [
					{
						key: "eng_street_name",
						label: "Street Name (English)",
						type: "text",
						placeholder: "DES VOEUX ROAD CENTRAL",
					},
					{
						key: "ch_street_name",
						label: "Street Name (Chinese)",
						type: "text",
						placeholder: "德輔道中",
					},
					{ key: "block", label: "Block / Tower", type: "text", placeholder: "BLOCK B" },
					{ key: "flat", label: "Flat", type: "text", placeholder: "A" },
					{ key: "floor", label: "Floor", type: "text", placeholder: "8" },
					{
						key: "free_entry",
						label: "Free Text (one per line)",
						type: "textarea",
						placeholder: "Kai Tak Commercial\nDes Voeux",
						description: "Each line matched independently — all must match",
						format: "newline-array",
					},
					{
						key: "house_prefix",
						label: "House Number",
						type: "text",
						placeholder: "86 or 80,90",
						description: "Single value (exact) or two comma-separated values (range)",
					},
					{ key: "house_suffix", label: "House Suffix", type: "text", placeholder: "A" },
				],
				bulkSamples: [
					{ eng_street_name: "DES VOEUX ROAD CENTRAL", ch_street_name: "德輔道中", block: "", flat: "", floor: "", free_entry: "", house_prefix: "86",  house_suffix: "" },
					{ eng_street_name: "NATHAN ROAD",            ch_street_name: "",         block: "", flat: "", floor: "", free_entry: "", house_prefix: "800", house_suffix: "" },
				],
			},
			{
				id: "lra-request",
				label: "Request Report",
				description:
					"Initiate a Land Registry report. Providing a PRN enables automated retrieval within ~5 minutes.",
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
					"Check status of a Land Registry report. Poll until 200 is returned.",
				method: "POST",
				path: "lra/poll",
				fields: [
					{
						key: "token",
						label: "Token",
						type: "text",
						required: true,
						placeholder: "eyJhbGci…",
						description: "JWT from /lra/request",
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
						placeholder: "Fill Easy Limited",
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
						placeholder: "Digital PDF Signing Powered by Fill Easy",
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
						placeholder: "Fill Easy Limited",
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
