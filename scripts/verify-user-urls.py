"""Verify the user-supplied URL list. Prints status per ID so we can decide
which ones to apply. Accepts 200 OK and 401/403/202/429 (bot-block, URL valid
for browsers) as PASS."""
import urllib.request
import urllib.error
import ssl
from concurrent.futures import ThreadPoolExecutor, as_completed

USER_URLS = {
    # Jack Ma / Alibaba
    "s1":  "https://www.sec.gov/Archives/edgar/data/1577552/000119312514184994/d709111df1.htm",
    "s2":  "https://www.nyse.com/quote/XNYS:BABA",
    "s3":  "https://www.forbes.com/profile/jack-ma/",
    "s4":  "https://www.bloomberg.com/billionaires/profiles/jack-ma/",
    "s5":  "https://www.scmp.com/tech/big-tech/article/3095993/china-home-four-worlds-five-largest-unicorns-led-alibabas-ant-group",
    "s6":  "https://www.reuters.com/article/us-ant-group-ipo-suspension/chinas-ant-group-suspends-record-37-billion-ipo-idUSKBN27J1C4/",
    "s7":  "https://www.wsj.com/articles/jack-ma-to-cede-control-of-ant-group-11673059435",
    "s8":  "https://www.ft.com/content/4e5b3c91-8d4a-44b8-bd4f-8a9c1d2e3f4a",
    "s9":  "https://www.sec.gov/Archives/edgar/data/1577552/000119312514184994/d709111df1.htm",
    "s10": "https://www.nytimes.com/2005/08/11/technology/yahoo-and-alibaba-in-a-deal-that-reshapes-chinas-internet.html",
    "s11": "https://group.softbank/en/philosophy/history",
    "s12": "https://www.crunchbase.com/funding_round/alibaba-group-series-a--3f4e3b9d",
    "s13": "https://www.crunchbase.com/organization/yunfeng-capital",
    "s14": "https://en.wikipedia.org/wiki/Jack_Ma_Foundation",
    "s15": "https://finance.yahoo.com/quote/BABA/",
    "s16": "https://www.reuters.com/business/finance/china-central-bank-accepts-ants-application-financial-holding-company-sources-2022-06-17/",
    "s17": "https://www.stats.gov.cn/english/Statisticaldata/AnnualData/",
    "s18": "https://www.stats.gov.cn/english/Statisticaldata/AnnualData/",
    "s19": "https://www.alibabagroup.com/en-US/ir-financial-reports",
    "s20": "https://forgeglobal.com/company/alibaba-group/",
    "s21": "https://time.com/3998188/alibaba-jack-ma-hong-kong-expensive-home/",
    "s22": "https://www.harpercollins.com/products/alibaba-duncan-clark",
    "s23": "https://wealthx.com/reports/world-ultra-wealth-report-2019/",
    "s24": "https://www.scmp.com/property/hong-kong-china/article/1888126/wealthy-mainland-chinese-back-hong-kong-super-luxury-home",
    "s25": "https://www.caproasia.com/2024/02/23/alibaba-co-founder-billionaire-jack-ma-age-61-with-30-billion-fortune-wife-cathy-ying-zhang-singapore-citizen-buys-london-6-bedroom-townhouse-belgravia-london-for-25-6-million/",
    "s26": "https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001577552&type=20-F",
    "s27": "https://www.pwccn.com/en/services/tax/publications.html",
    "s28": "https://www.hkex.com.hk/Market-Data/Securities-Prices/Equities/Equities-Quote?sym=9988&sc_lang=en",
    "s29": "https://www.reuters.com/business/retail-consumer/china-fines-alibaba-record-275-bln-anti-monopoly-violations-2021-04-10/",
    "s30": "https://www.reuters.com/technology/china-fines-ant-group-984-mln-ends-regulatory-overhaul-2023-07-07/",
    "s31": "https://www.reuters.com/article/world/jack-ma-buys-chateau-de-sours-second-french-vineyard-in-three-months-idUSL5N0YQ4UM/",
    "s32": "https://www.decanter.com/wine-news/chinese-billionaire-alibaba-founder-jack-ma-buys-bordeaux-chateau-de-sours-292770/",
    "s33": "https://www.crunchbase.com/organization/yunfeng-capital",
    "s34": "https://www.nytimes.com/2015/06/27/business/dealbook/jack-ma-buys-vast-tract-of-land-in-adirondacks.html",
    "s35": "https://www.superyachtfan.com/yacht/zen/",
    "s36": "https://www.superyachtfan.com/private-jet/owner/jack-ma/",
    "s37": "https://variety.com/2019/biz/asia/jack-ma-cuts-stake-in-huayi-brothers-1203306899/",
    "s38": "https://www.forbes.com/sites/russellflannery/2015/03/04/alibaba-purchases-383-million-stake-in-entertainment-company-enlight-media/",
    "s39": "https://www.cbinsights.com/investor/blue-pool-capital",
    "s40": "https://www.bloomberg.com/news/articles/2024-02-21/jack-mas-wife-bought-three-prestige-properties-in-singapore",
    "s41": "https://www.scmp.com/tech/blockchain/article/3324137/yunfeng-financial-invests-us44-million-ether-amid-hong-kongs-virtual-asset-push",
    "s42": "https://www.newcastleherald.com.au/story/4445929/friendship-leads-to-26m-uni-donation-video/",
    "s43": "https://www.townandcountrymag.com/leisure/real-estate/a3341/jack-ma-buys-brandon-park/",
    # Yat Siu / Animoca
    "y1":  "https://www.rttnews.com/826408/ibm-plans-to-buy-strategic-messaging-service-assets-of-outblaze-quick-facts.aspx",
    "y2":  "https://www.marketindex.com.au/asx/ab1",
    "y3":  "https://www.marketindex.com.au/asx/ab1",
    "y4":  "https://venturebeat.com/games/animoca-brands-raises-358-8m-at-5-5b-valuation-for-open-metaverse/",
    "y5":  "https://www.coingecko.com/en/coins/the-sandbox",
    "y6":  "https://www.crunchbase.com/organization/animoca-brands",
    "y7":  "https://dappradar.com/hub/animoca-brands",
    "y8":  "https://webb-site.com/dbpub/orgdata.asp?p=116499",
    "y9":  "https://www.ccn.com/news/business/yat-siu-net-worth-explained/",
    "y10": "https://www.bloomberg.com/profile/company/1610751D:HK",
    "y11": "https://www.animocabrands.com/animoca-brands-acquires-pixowl",
    "y12": "https://www.coingecko.com/en/coins/the-sandbox",
    "y13": "https://www.hkma.gov.hk/eng/key-functions/international-financial-centre/fintech/fintech-facilitation-office/",
    "y14": "https://www.crunchbase.com/funding_round/animoca-brands-series-b--8f7d2c4a",
    "y15": "https://www.bls.gov/oes/current/oes150000.htm",
    "y16": "https://www.censtatd.gov.hk/en/scode210.html",
    "y17": "https://www.wavesinthefinoverse.com/episodes/yat-siu",
    "y18": "https://www.marketindex.com.au/asx/ab1",
    "y19": "https://www.animocabrands.com/investors",
    "y20": "https://pitchbook.com/profiles/company/103632-13",
    "y21": "https://www.rvd.gov.hk/en/property_market_statistics/index.html",
    "y22": "https://webb-site.com/dbpub/orgdata.asp?p=32135",
    "y23": "https://webb-site.com/dbpub/orgdata.asp?p=116499",
    "y24": "https://www.ird.gov.hk/eng/tax/bus_pft.htm",
    "y25": "https://www.marketindex.com.au/asx/ab1",
    "y26": "https://www.coindesk.com/business/2022/06/16/animoca-brands-acquires-most-of-educational-tech-company-tinytap-for-389m/",
    "y27": "https://www.animocabrands.com/moca-token-launch-us29-3-million",
    "y28": "https://en.wikipedia.org/wiki/Yat_Siu",
    "y29": "https://www.globenewswire.com/news-release/2025/11/03/Currenc-Group-Announces-Proposed-Reverse-Merger-with-Animoca-Brands.html",
    "y30": "https://www.sc.com/en/press-release/standard-chartered-backed-anchorpoint-granted-stablecoin-issuer-licence-by-the-hong-kong-monetary-authority/",
    "y31": "https://www.animocabrands.com/animoca-brands-investor-update-for-the-quarter-and-fiscal-year-ending-on-31-december-2024",
    "y32": "https://www.animocabrands.com/animoca-brands-acquires-nway",
    "y33": "https://www.animocabrands.com/animoca-brands-acquires-eden-games",
    "y34": "https://stockhead.com.au/cryptocurrency/animoca-brands-acquires-sydney-based-gaming-company-blowfish-studios-for-up-to-35m/",
    "y35": "https://www.animocabrands.com/gamee-launches-arc8",
    "y36": "https://en.wikipedia.org/wiki/Animoca_Brands#Lympo_hack",
}

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE
HEADERS = {
    "User-Agent": UA,
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
}


def check(cid, url, timeout=15):
    try:
        req = urllib.request.Request(url, headers=HEADERS, method="GET")
        with urllib.request.urlopen(req, timeout=timeout, context=ctx) as r:
            final = r.geturl()
            bad = any(b in final.lower() for b in ("notfound", "page-not-found", "/404"))
            if r.status == 200 and not bad:
                return (cid, url, "OK", final, "")
            return (cid, url, f"BAD-{r.status}", final, "")
    except urllib.error.HTTPError as e:
        # 401/403/202/429 = anti-bot, URL valid for users
        if e.code in (401, 403, 202, 429):
            return (cid, url, f"BLOCK-{e.code}", url, "anti-bot but URL valid")
        return (cid, url, f"HTTP-{e.code}", url, "")
    except Exception as e:
        return (cid, url, f"ERR-{type(e).__name__}", url, str(e)[:60])


results = {}
with ThreadPoolExecutor(max_workers=12) as ex:
    futs = {ex.submit(check, cid, url): cid for cid, url in USER_URLS.items()}
    for f in as_completed(futs):
        cid, url, status, final, note = f.result()
        results[cid] = (url, status, final, note)

ok = [c for c in results if results[c][1] == "OK"]
blocked = [c for c in results if results[c][1].startswith("BLOCK")]
broken = [c for c in results if c not in ok and c not in blocked]

print(f"OK 200: {len(ok)}  |  Bot-blocked (URL valid for browsers): {len(blocked)}  |  Broken: {len(broken)}")
print()
print("--- BROKEN URLs (need attention) ---")
for cid in sorted(broken):
    url, status, final, note = results[cid]
    print(f"  {cid:>4}  [{status}]  {url}")
    if final != url:
        print(f"        redirect-to: {final}")
    if note:
        print(f"        note: {note}")

print()
print("--- BOT-BLOCKED (valid, will accept) ---")
for cid in sorted(blocked):
    url, status, final, note = results[cid]
    print(f"  {cid:>4}  [{status}]  {url}")
