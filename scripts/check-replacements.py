import urllib.request
import urllib.error
import ssl
import json
from concurrent.futures import ThreadPoolExecutor, as_completed

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE


def check(url, timeout=12):
    try:
        req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "*/*"}, method="GET")
        with urllib.request.urlopen(req, timeout=timeout, context=ctx) as r:
            final = r.geturl()
            bad_markers = ("notfound", "page-not-found", "404", "error")
            if r.status == 200 and not any(b in final.lower() for b in bad_markers):
                return ("OK", final)
            return (f"REDIR-BAD:{r.status}", final)
    except urllib.error.HTTPError as e:
        if e.code in (401, 403):
            return (f"BLOCKED:{e.code}", url)
        return (f"HTTP:{e.code}", url)
    except Exception as e:
        return (f"ERR:{type(e).__name__}", url)


candidates = {
    "https://ag.ny.gov/press-release/2024/attorney-general-james-wins-landmark-victory": [
        "https://ag.ny.gov/press-release/2024/attorney-general-james-wins-landmark-victory-against-donald-trump",
        "https://ag.ny.gov/press-release/2024/judge-issues-decision-attorney-general-james-landmark-civil-fraud-trial",
        "https://www.nycourts.gov/courts/comdiv/NY/PDFs/People-v.-Trump-Decision-and-Order-on-Liability.pdf",
        "https://apnews.com/article/trump-fraud-trial-engoron-verdict-de80d7c95a78f24fffbf9bd8e88f4b9b",
        "https://ag.ny.gov/press-releases",
    ],
    "https://finance.yahoo.com/quote/BABA/history/": [
        "https://finance.yahoo.com/quote/BABA/history",
        "https://finance.yahoo.com/quote/BABA/",
        "https://finance.yahoo.com/quote/BABA",
    ],
    "https://finance.yahoo.com/quote/DJT/history/": [
        "https://finance.yahoo.com/quote/DJT/history",
        "https://finance.yahoo.com/quote/DJT/",
        "https://finance.yahoo.com/quote/DJT",
    ],
    "https://www.asx.com.au/markets/company/AB1": [
        "https://www.asx.com.au/markets/company/ab1",
        "https://www.marketindex.com.au/asx/ab1",
        "https://www.asx.com.au/markets/trade-our-cash-market/directory",
    ],
    "https://www.cnbc.com/2015/06/26/jack-ma-buys-28100-acre-property-in-adirondacks.html": [
        "https://www.cnbc.com/2015/06/26/chinas-jack-ma-buys-28100-acre-property-in-adirondacks.html",
        "https://www.nytimes.com/2015/06/27/business/jack-ma-buys-vast-tract-of-land-in-adirondacks.html",
        "https://www.theguardian.com/world/2015/jun/27/jack-ma-buys-adirondacks-land-alibaba",
        "https://www.bloomberg.com/news/articles/2015-06-26/alibaba-s-jack-ma-buys-28-100-acres-of-adirondacks-wilderness",
    ],
    "https://www.scmp.com/business/article/3175321/jack-ma-property-hong-kong-peak-mansion": [
        "https://www.bloomberg.com/news/articles/2015-04-09/jack-ma-said-to-be-buyer-of-191-million-hong-kong-peak-home",
        "https://www.scmp.com/business/companies/article/1772898/jack-ma-rumoured-be-buyer-15-billion-peak-mansion",
        "https://www.scmp.com/topics/jack-ma",
    ],
    "https://www.scmp.com/lifestyle/food-drink/article/1858015/jack-ma-buys-bordeaux-vineyard": [
        "https://www.decanter.com/wine-news/jack-ma-buys-chateau-de-sours-bordeaux-272167/",
        "https://www.reuters.com/article/world/jack-ma-buys-chateau-de-sours-second-french-vineyard-in-three-months-idUSL5N0YQ4UM/",
        "https://www.scmp.com/topics/jack-ma",
    ],
    "https://www.scmp.com/tech/big-tech/article/3108728/": [
        "https://www.scmp.com/tech/big-tech",
        "https://www.scmp.com/topics/alibaba",
    ],
    "https://www.scmp.com/tech/blockchain/article/3324137/": [
        "https://www.scmp.com/topics/blockchain",
        "https://www.scmp.com/topics/animoca-brands",
    ],
    "https://www.equilar.com/reports/chinese-tech-executive-compensation": [
        "https://www.equilar.com/reports.html",
        "https://www.equilar.com/research.html",
        "https://www.equilar.com/",
    ],
    "https://www.ura.gov.sg/realEstateIIWeb/": [
        "https://www.ura.gov.sg/property-market-information/pmiResidentialTransactionSearch",
        "https://www.ura.gov.sg/realis",
        "https://www.ura.gov.sg/Corporate/Property/Property-Data",
        "https://www.ura.gov.sg/",
    ],
    "https://www.jackmafoundation.org/": [
        "http://www.jackmafoundation.org/en",
        "https://en.wikipedia.org/wiki/Jack_Ma_Foundation",
        "https://www.alibabagroup.com/en-US/document-1502898226306-1502898226306",
    ],
    "http://www.chinatax.gov.cn/eng/": [
        "http://web.archive.org/web/2024/http://www.chinatax.gov.cn/eng/",
        "https://www.chinatax.gov.cn/eng/",
    ],
    "http://www.stats.gov.cn/english/Statisticaldata/": [
        "http://web.archive.org/web/2024/http://www.stats.gov.cn/english/Statisticaldata/",
        "https://www.stats.gov.cn/english/",
    ],
    "http://www.stats.gov.cn/english/Statisticaldata/AnnualData/": [
        "http://web.archive.org/web/2024/http://www.stats.gov.cn/english/Statisticaldata/AnnualData/",
        "https://www.stats.gov.cn/english/",
    ],
    "https://www.forbes.com/sites/danalexander/": [
        "https://www.forbes.com/profile/dan-alexander/",
        "https://www.forbes.com/sites/danalexander",
    ],
    "https://www2.asx.com.au/markets/trade-our-cash-market/directory": [
        "https://www.asx.com.au/markets/trade-our-cash-market/directory",
    ],
    "https://www.miamidade.gov/pa/": [
        "https://www.miamidadepa.gov/pa/home.page",
        "https://www.miamidadepa.gov/",
    ],
    "https://www.pbcgov.org/papa/": [
        "https://pbcpao.gov/",
    ],
    "https://www.animocabrands.com/animoca-brands-acquires-eden-games": [
        "https://www.animocabrands.com/announcement/animoca-brands-acquires-eden-games-developer-of-need-for-speed-porsche-unleashed-f1-mobile-racing-gearclub-and-test-drive-from-engine-gaming-media",
    ],
    "https://www.animocabrands.com/animoca-brands-acquires-pixowl": [
        "https://www.animocabrands.com/announcement/animoca-brands-acquires-pixowl-developer-of-the-sandbox-game-for-mobile-and-blockchain-asx-release",
    ],
    "https://www.animocabrands.com/animoca-brands-investor-update-for-the-quarter-and-fiscal-year-ending-on-31-december-2024": [
        "https://www.animocabrands.com/announcement/animoca-brands-investor-update-for-the-quarter-and-fiscal-year-ending-on-31-december-2024",
    ],
    "https://www.animocabrands.com/animocabrands-acquire-nway": [
        "https://www.animocabrands.com/announcement/animoca-brands-completes-acquisition-of-nway",
        "https://www.animocabrands.com/newsroom",
    ],
    "https://www.animocabrands.com/gamee-launches-arc8-play-to-earn-mobile-blockchain-gaming-platform-with-1300000-users": [
        "https://www.animocabrands.com/announcement/gamee-launches-arc8-play-to-earn-mobile-blockchain-gaming-platform-with-13-million-users",
    ],
    "https://www.animocabrands.com/investors": [
        "https://www.animocabrands.com/investors-relations",
    ],
    "https://www.animocabrands.com/moca-foundation-concludes-moca-token-launch-with-usd29300000-committed": [
        "https://www.animocabrands.com/announcement/moca-foundation-concludes-moca-token-launch-with-us293-million-committed-at-12x-oversubscription",
    ],
    "https://stockhead.com.au/cryptocurrency/animoca-brands-acquires-sydney-based-gaming-company-blowfish-studios/": [
        "https://stockhead.com.au/cryptocurrency/animoca-brands-acquires-sydney-based-gaming-company-blowfish-studios-for-up-to-35m/",
    ],
    "https://www.dbs.com.sg/private-banking/": [
        "https://www.dbs.com.sg/private-banking/default.page",
    ],
    "https://www.dos.ny.gov/corps/": [
        "https://dos.ny.gov/existing-corporations-and-businesses",
    ],
    "https://www.wealthx.com/report/world-ultra-wealth-report/": [
        "https://wealthx.com/reports/world-ultra-wealth-report-2019",
        "https://wealthx.com/",
    ],
    "https://www.newcastleherald.com.au/story/4445929/": [
        "https://www.newcastleherald.com.au/story/4445929/friendship-leads-to-26m-uni-donation-video/",
    ],
}


def find(orig, cands):
    for c in cands:
        st, final = check(c)
        if st == "OK" or st.startswith("BLOCKED"):
            return (orig, c, st)
    return (orig, None, "ALL_FAILED")


resolved = {}
with ThreadPoolExecutor(max_workers=8) as ex:
    futs = {ex.submit(find, k, v): k for k, v in candidates.items()}
    for f in as_completed(futs):
        orig, picked, st = f.result()
        resolved[orig] = picked
        print(f"{orig}")
        print(f"  -> {picked or '!! NO REPLACEMENT FOUND'}  [{st}]")

print()
print("=== Resolved JSON ===")
print(json.dumps({k: v for k, v in resolved.items() if v}, indent=2))
