"""Apply user-supplied URLs to sow-mock-data.ts.

For each ID:
- If the user's URL was VERIFIED-WORKING (200 OK or anti-bot 401/403/202/429/406),
  update the citation's `url` field to it.
- For IDs where the user has explicitly switched outlets (Fill Easy sample PDF
  -> external article, or one outlet to another), also rewrite the citation's
  label and the srcMeta(...) domain + page title + description so they stay in
  sync with the new URL.
- For IDs whose user URL is broken (404/DNS), keep the current file value.
"""
import re
from pathlib import Path

DATA = Path(r"C:/Claude/sow-assessment-platform/src/lib/sow-mock-data.ts")
text = DATA.read_text(encoding="utf-8")


# Each entry: (new_url, optional rewrite tuple)
# rewrite = (new_label, new_domain, new_page_title, new_desc, favicon_color)
# If `rewrite` is None, only the `url` field changes.
APPLY = {
    # ===== Jack Ma / Alibaba =====
    "s1":  ("https://www.sec.gov/Archives/edgar/data/1577552/000119312514184994/d709111df1.htm", None),
    "s2":  ("https://www.nyse.com/quote/XNYS:BABA", None),
    "s3":  ("https://www.forbes.com/profile/jack-ma/", None),
    "s4":  ("https://www.bloomberg.com/billionaires/profiles/jack-ma/", None),
    # s5 broken — keep current
    "s6":  ("https://www.reuters.com/article/us-ant-group-ipo-suspension/chinas-ant-group-suspends-record-37-billion-ipo-idUSKBN27J1C4/", None),
    "s7":  ("https://www.wsj.com/articles/jack-ma-to-cede-control-of-ant-group-11673059435", None),
    "s8":  ("https://www.ft.com/content/4e5b3c91-8d4a-44b8-bd4f-8a9c1d2e3f4a", None),
    # s9: user re-targets the Fill Easy SAMR sample to the SEC F-1. Update the
    # citation so label/srcMeta match the SEC outlet.
    "s9":  ("https://www.sec.gov/Archives/edgar/data/1577552/000119312514184994/d709111df1.htm", (
        "SEC EDGAR: Alibaba Group Holding Limited — Form F-1 (2014)",
        "sec.gov",
        "Form F-1 | Alibaba Group Holding Limited | SEC EDGAR",
        "SEC EDGAR registration statement for Alibaba Group Holding Limited filed in connection with the 2014 NYSE listing — includes financial statements, share structure, and Variable Interest Entity disclosures.",
        "#003366",
    )),
    "s10": ("https://www.nytimes.com/2005/08/11/technology/yahoo-and-alibaba-in-a-deal-that-reshapes-chinas-internet.html", None),
    "s11": ("https://group.softbank/en/philosophy/history", None),
    "s12": ("https://www.crunchbase.com/funding_round/alibaba-group-series-a--3f4e3b9d", None),
    "s13": ("https://www.crunchbase.com/organization/yunfeng-capital", None),
    "s14": ("https://en.wikipedia.org/wiki/Jack_Ma_Foundation", None),
    "s15": ("https://finance.yahoo.com/quote/BABA/", None),
    # s16: user re-targets PBOC homepage to a Reuters article about the same restructuring approval.
    "s16": ("https://www.reuters.com/business/finance/china-central-bank-accepts-ants-application-financial-holding-company-sources-2022-06-17/", (
        "Reuters: PBOC accepts Ant Group financial holding company application",
        "reuters.com",
        "China central bank accepts Ant's application for financial holding company | Reuters",
        "Reuters report dated June 17, 2022 covering the People's Bank of China's acceptance of Ant Group's financial holding company application, a milestone in the post-suspension regulatory restructuring.",
        "#fa6400",
    )),
    # s17, s18: stats.gov.cn — keep current /english/ which works; skip
    "s19": ("https://www.alibabagroup.com/en-US/ir-financial-reports", None),
    # s20: SharesPost is now Forge Global
    "s20": ("https://forgeglobal.com/company/alibaba-group/", (
        "Forge Global (formerly SharesPost): Alibaba pre-IPO secondary trading",
        "forgeglobal.com",
        "Alibaba Group | Forge Global Private Markets",
        "Forge Global private-market profile for Alibaba Group, successor to SharesPost's secondary marketplace. Shows pre-IPO secondary transactions and reference pricing data for restricted founder/employee shares.",
        "#0a1f44",
    )),
    # s21: switch from Bloomberg to TIME for the $193M Peak home story.
    "s21": ("https://time.com/3998188/alibaba-jack-ma-hong-kong-expensive-home/", (
        "TIME: Jack Ma is the buyer behind Hong Kong's most expensive home",
        "time.com",
        "Jack Ma Identified as Buyer of Hong Kong's $193 Million Home | TIME",
        "TIME report identifying Jack Ma as the buyer of a Victoria Peak residence (15 Barker Road) for approximately US$193M — at the time a record price for residential property in Hong Kong.",
        "#e90606",
    )),
    "s22": ("https://www.harpercollins.com/products/alibaba-duncan-clark", None),
    "s23": ("https://wealthx.com/reports/world-ultra-wealth-report-2019/", None),
    # s24 broken — keep current Fill Easy sample
    # s25 broken — keep current
    "s26": ("https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001577552&type=20-F", None),
    # s27: PWC China IIT guide replaces chinatax.gov.cn (which is blocked outside CN)
    "s27": ("https://www.pwccn.com/en/services/tax/publications.html", (
        "PwC China: Tax Publications (IIT and corporate tax guides)",
        "pwccn.com",
        "Tax Publications | PwC China",
        "PwC China publications hub covering individual income tax (IIT) and corporate tax guides referenced as a public-record substitute for direct Chinese tax authority filings.",
        "#d04a02",
    )),
    # s28: switch Fill Easy HK CR sample to HKEX equity quote for Alibaba (HK listing)
    "s28": ("https://www.hkex.com.hk/Market-Data/Securities-Prices/Equities/Equities-Quote?sym=9988&sc_lang=en", (
        "HKEX: Alibaba Group Holding Limited (9988.HK) equity quote",
        "hkex.com.hk",
        "Alibaba Group Holding Limited (9988) | HKEX Equities Quote",
        "Hong Kong Exchanges and Clearing real-time equities quote for Alibaba Group Holding Limited (HKEX: 9988). Provides last trade, market cap, turnover, and announcement history.",
        "#0033a0",
    )),
    # s29: switch Fill Easy SAMR Credit sample to Reuters Alibaba antitrust fine
    "s29": ("https://www.reuters.com/business/retail-consumer/china-fines-alibaba-record-275-bln-anti-monopoly-violations-2021-04-10/", (
        "Reuters: China fines Alibaba record US$2.75B for anti-monopoly violations",
        "reuters.com",
        "China fines Alibaba record $2.75 bln for anti-monopoly violations | Reuters",
        "Reuters report on China's State Administration for Market Regulation imposing a record US$2.75B antitrust fine on Alibaba in April 2021. Penalty equivalent to 4% of 2019 domestic sales.",
        "#fa6400",
    )),
    # s30: switch Fill Easy SAMR Judicial sample to Reuters Ant Group fine
    "s30": ("https://www.reuters.com/technology/china-fines-ant-group-984-mln-ends-regulatory-overhaul-2023-07-07/", (
        "Reuters: China fines Ant Group US$984M, ends regulatory overhaul",
        "reuters.com",
        "China fines Ant Group $984 mln, ends regulatory overhaul | Reuters",
        "Reuters report on the People's Bank of China announcement closing the multi-year Ant Group regulatory overhaul with a US$984M fine — marking the end of the restructuring phase that began with the 2020 IPO suspension.",
        "#fa6400",
    )),
    "s31": ("https://www.reuters.com/article/world/jack-ma-buys-chateau-de-sours-second-french-vineyard-in-three-months-idUSL5N0YQ4UM/", None),
    # s32 broken — keep current
    # s33: switch Fill Easy SAMR UBO sample to Crunchbase Yunfeng
    "s33": ("https://www.crunchbase.com/organization/yunfeng-capital", (
        "Crunchbase: Yunfeng Capital — investor profile and UBO chain",
        "crunchbase.com",
        "Yunfeng Capital | Crunchbase",
        "Crunchbase organisation profile for Yunfeng Capital — co-founded by Jack Ma. AUM approximately US$8B with disclosed investments. Provides a referenceable UBO chain via aggregated public filings.",
        "#0288d1",
    )),
    "s34": ("https://www.nytimes.com/2015/06/27/business/dealbook/jack-ma-buys-vast-tract-of-land-in-adirondacks.html", None),
    "s35": ("https://www.superyachtfan.com/yacht/zen/", None),
    "s36": ("https://www.superyachtfan.com/private-jet/owner/jack-ma/", None),
    # s37 broken — keep current Hollywood Reporter
    # s38 broken — keep current Bloomberg
    "s39": ("https://www.cbinsights.com/investor/blue-pool-capital", None),
    "s40": ("https://www.bloomberg.com/news/articles/2024-02-21/jack-mas-wife-bought-three-prestige-properties-in-singapore", None),
    "s41": ("https://www.scmp.com/tech/blockchain/article/3324137/yunfeng-financial-invests-us44-million-ether-amid-hong-kongs-virtual-asset-push", None),
    "s42": ("https://www.newcastleherald.com.au/story/4445929/friendship-leads-to-26m-uni-donation-video/", None),
    # s43: Town & Country article on Brandon Park
    "s43": ("https://www.townandcountrymag.com/leisure/real-estate/a3341/jack-ma-buys-brandon-park/", (
        "Town & Country: Jack Ma's purchase of Brandon Park (Adirondacks)",
        "townandcountrymag.com",
        "Jack Ma Buys 28,000-Acre Adirondacks Estate | Town & Country",
        "Town & Country feature on Jack Ma's acquisition of Brandon Park, the 28,100-acre Adirondacks estate purchased via New Brandon LLC for approximately US$23M.",
        "#000000",
    )),
    # ===== Yat Siu / Animoca =====
    "y1":  ("https://www.rttnews.com/826408/ibm-plans-to-buy-strategic-messaging-service-assets-of-outblaze-quick-facts.aspx", None),
    "y2":  ("https://www.marketindex.com.au/asx/ab1", None),
    "y3":  ("https://www.marketindex.com.au/asx/ab1", None),
    "y4":  ("https://gamesbeat.com/animoca-brands-raises-358-8m-at-5-5b-valuation-for-open-metaverse", None),
    "y5":  ("https://www.coingecko.com/en/coins/the-sandbox", None),
    "y6":  ("https://www.crunchbase.com/organization/animoca-brands", None),
    # y7 broken (deep DappRadar) — keep current homepage
    # y8: Fill Easy HK CR Outblaze sample -> Webb-Site Outblaze entry
    "y8":  ("https://webb-site.com/dbpub/orgdata.asp?p=116499", (
        "Webb-Site Who's Who: Outblaze Limited (HK CR records)",
        "webb-site.com",
        "Outblaze Limited | Webb-site Who's Who",
        "Webb-site Who's Who organisation profile for Outblaze Limited, sourced from HK Companies Registry filings — directors, officers, and historical filings.",
        "#1a4a8a",
    )),
    "y9":  ("https://www.ccn.com/news/business/yat-siu-net-worth-explained/", None),
    "y10": ("https://www.bloomberg.com/profile/company/1610751D:HK", None),
    # y11: shorter Animoca URL — verified 200 via redirect to the announcement page
    "y11": ("https://www.animocabrands.com/animoca-brands-acquires-pixowl", None),
    "y12": ("https://www.coingecko.com/en/coins/the-sandbox", None),
    # y13 broken — keep current HKMA fintech root
    "y14": ("https://www.crunchbase.com/funding_round/animoca-brands-series-b--8f7d2c4a", None),
    "y15": ("https://www.bls.gov/oes/current/oes150000.htm", None),
    "y16": ("https://www.censtatd.gov.hk/en/scode210.html", None),
    # y17 broken (DNS) — keep current Fill Easy land registry sample
    "y18": ("https://www.marketindex.com.au/asx/ab1", None),
    "y19": ("https://www.animocabrands.com/investors", None),
    "y20": ("https://pitchbook.com/profiles/company/103632-13", None),
    # y21 broken — keep current
    # y22: Fill Easy HK CR Animoca sample -> Webb-Site Animoca entry
    "y22": ("https://webb-site.com/dbpub/orgdata.asp?p=32135", (
        "Webb-Site Who's Who: Animoca Brands Limited (HK CR records)",
        "webb-site.com",
        "Animoca Brands Limited | Webb-site Who's Who",
        "Webb-site Who's Who organisation profile for Animoca Brands Limited, sourced from HK Companies Registry filings — directors (including SIU Yat), officers, and historical filings.",
        "#1a4a8a",
    )),
    # y23: Fill Easy HK CR Outblaze sample -> Webb-Site Outblaze entry (same as y8)
    "y23": ("https://webb-site.com/dbpub/orgdata.asp?p=116499", (
        "Webb-Site Who's Who: Outblaze Limited (HK CR records)",
        "webb-site.com",
        "Outblaze Limited | Webb-site Who's Who",
        "Webb-site Who's Who organisation profile for Outblaze Limited, sourced from HK Companies Registry filings — Yat Siu listed as director, incorporation date, and historical filings.",
        "#1a4a8a",
    )),
    "y24": ("https://www.ird.gov.hk/eng/tax/bus_pft.htm", None),
    # y25: Fill Easy ASIC Animoca sample -> MarketIndex AB1 (Australian listing record)
    "y25": ("https://www.marketindex.com.au/asx/ab1", (
        "MarketIndex: Animoca Brands (AB1) — Australian listing record",
        "marketindex.com.au",
        "Animoca Brands (AB1) | Market Index",
        "Market Index page for Animoca Brands (former ASX ticker AB1) — captures Australian listing history, register of directors, and delisting record. Substitute for direct ASIC company-register access.",
        "#1976d2",
    )),
    # y26: keep current no-slash CoinDesk URL (the user's trailing-slash version 308s)
    # y27 broken (short Animoca URL) — keep current /announcement/ URL
    "y28": ("https://en.wikipedia.org/wiki/Yat_Siu", None),
    # y29 broken (GlobeNewswire) — keep current Bloomberg
    "y30": ("https://www.sc.com/en/press-release/standard-chartered-backed-anchorpoint-granted-stablecoin-issuer-licence-by-the-hong-kong-monetary-authority/", None),
    "y31": ("https://www.animocabrands.com/animoca-brands-investor-update-for-the-quarter-and-fiscal-year-ending-on-31-december-2024", None),
    # y32 broken (short Animoca URL) — keep current /announcement/ URL
    # y33: short Animoca URL works via redirect; keep current long URL anyway (canonical)
    "y34": ("https://stockhead.com.au/cryptocurrency/animoca-brands-acquires-sydney-based-gaming-company-blowfish-studios-for-up-to-35m/", None),
    # y35 broken (short Animoca URL) — keep current /announcement/ URL
    "y36": ("https://en.wikipedia.org/wiki/Animoca_Brands#Lympo_hack", None),
}


def find_block_bounds(src: str, cid: str) -> tuple[int, int] | None:
    """Find the citation block containing `id: "<cid>"`.

    Walks backward from the id-match to the opening `{`, then forward through
    matching braces to the closing `}`.
    """
    id_match = re.search(rf'id:\s*"{re.escape(cid)}"(?![\w-])', src)
    if not id_match:
        return None
    # Walk backward to find the opening `{` that starts this object literal.
    i = id_match.start() - 1
    depth = 0
    while i >= 0:
        c = src[i]
        if c == "}":
            depth += 1
        elif c == "{":
            if depth == 0:
                break
            depth -= 1
        i -= 1
    if i < 0:
        return None
    start = i  # position of opening `{`
    # Walk forward to matching `}`.
    depth = 0
    j = start
    while j < len(src):
        c = src[j]
        if c == "{":
            depth += 1
        elif c == "}":
            depth -= 1
            if depth == 0:
                j += 1
                break
        j += 1
    return (start, j)


def update_block(src: str, cid: str, new_url: str, rewrite) -> tuple[str, str]:
    bounds = find_block_bounds(src, cid)
    if not bounds:
        return src, "NOT_FOUND"
    start, end = bounds
    block = src[start:end]
    new_block = block

    # Always update top-level `url: "..."` (first occurrence in the block).
    new_block, count = re.subn(
        r'(\burl:\s*")[^"]*(")',
        lambda m: m.group(1) + new_url + m.group(2),
        new_block, count=1,
    )

    if rewrite is not None:
        label, domain, page_title, desc, color = rewrite
        # Replace label
        new_block = re.sub(
            r'(\blabel:\s*")[^"]*(")',
            lambda m: m.group(1) + label + m.group(2),
            new_block, count=1,
        )
        # Replace srcMeta(...) call with new args (domain, page_title, desc, color, optional verifiedBy)
        sm_pattern = re.compile(
            r'(\.\.\.srcMeta\()'
            r'"[^"]*"'           # domain
            r'(\s*,\s*)'
            r'"[^"]*"'           # page title (may contain escaped chars but typically none)
            r'(\s*,\s*)'
            r'"(?:\\.|[^"\\])*"' # desc (could contain escapes)
            r'(\s*,\s*)'
            r'"[^"]*"'           # color
        )
        def sm_replace(m):
            return (
                m.group(1)
                + f'"{domain}"' + m.group(2)
                + f'"{page_title}"' + m.group(3)
                + f'"{desc}"' + m.group(4)
                + f'"{color}"'
            )
        new_block = sm_pattern.sub(sm_replace, new_block, count=1)

    if new_block == block:
        return src, "NO_CHANGE"
    return src[:start] + new_block + src[end:], "UPDATED"


changes = {"UPDATED": 0, "NO_CHANGE": 0, "NOT_FOUND": 0}
notes = []
for cid, (new_url, rewrite) in APPLY.items():
    text, status = update_block(text, cid, new_url, rewrite)
    changes[status] = changes.get(status, 0) + 1
    if status != "UPDATED":
        notes.append(f"  {cid}: {status}")

DATA.write_text(text, encoding="utf-8")
print(f"Applied: {changes['UPDATED']}  No-change: {changes['NO_CHANGE']}  Not-found: {changes['NOT_FOUND']}")
for n in notes:
    print(n)
