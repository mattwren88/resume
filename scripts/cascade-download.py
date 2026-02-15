#!/usr/bin/env python3
"""
Download all assets from a Cascade CMS site via the REST API.

Usage with creds file (recommended):
    python3 scripts/cascade-download.py --creds scripts/cascade-creds.json

Usage with CLI args:
    python3 scripts/cascade-download.py \
        --url https://cascade.example.edu \
        --api-key YOUR_API_KEY \
        --site "site-name" \
        --output projects/site-name

Creds file format (scripts/cascade-creds.json):
    {
        "url": "https://cascade.example.edu",
        "api_key": "YOUR_API_KEY",
        "site": "your-site-name"
    }
"""

import argparse
import base64
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request


class CascadeDownloader:
    def __init__(self, base_url, api_key, site_name, output_dir, delay=0.1, force=False):
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        self.site_name = site_name
        self.output_dir = output_dir
        self.delay = delay
        self.force = force
        self.stats = {
            "pages": 0, "files": 0, "folders": 0, "formats": 0,
            "blocks": 0, "templates": 0, "data_definitions": 0,
            "metadata_sets": 0, "errors": 0,
        }

    def api_post(self, endpoint, payload):
        url = f"{self.base_url}/api/v1/{endpoint}"
        body = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(url, data=body, method="POST")
        req.add_header("Authorization", f"Bearer {self.api_key}")
        req.add_header("Content-Type", "application/json")
        try:
            with urllib.request.urlopen(req) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            err_body = e.read().decode("utf-8", errors="replace")
            print(f"  ERROR {e.code} for POST {url}: {err_body[:200]}", file=sys.stderr)
            return None
        except urllib.error.URLError as e:
            print(f"  ERROR connecting to {url}: {e.reason}", file=sys.stderr)
            return None

    def _encode_path(self, *parts):
        """URL-encode each path segment individually, preserving / separators."""
        segments = []
        for part in parts:
            if not part:
                continue
            # Split on / so each segment is encoded but slashes are preserved
            for seg in part.split("/"):
                if seg:
                    segments.append(urllib.parse.quote(seg, safe=""))
        return "/".join(segments)

    def api_get(self, endpoint):
        url = f"{self.base_url}/api/v1/{endpoint}"
        req = urllib.request.Request(url)
        req.add_header("Authorization", f"Bearer {self.api_key}")
        try:
            with urllib.request.urlopen(req) as resp:
                return json.loads(resp.read().decode("utf-8"))
        except urllib.error.HTTPError as e:
            body = e.read().decode("utf-8", errors="replace")
            print(f"  ERROR {e.code} for {url}: {body[:200]}", file=sys.stderr)
            return None
        except urllib.error.URLError as e:
            print(f"  ERROR connecting to {url}: {e.reason}", file=sys.stderr)
            return None

    def ensure_dir(self, path):
        os.makedirs(path, exist_ok=True)

    def write_file(self, local_path, content, binary=False):
        if not self.force and os.path.exists(local_path):
            print(f"  SKIP (exists): {local_path}")
            return
        self.ensure_dir(os.path.dirname(local_path))
        if binary:
            with open(local_path, "wb") as f:
                f.write(content)
        else:
            with open(local_path, "w", encoding="utf-8") as f:
                f.write(content)
        print(f"  SAVED: {local_path}")

    def download_page(self, asset_path):
        data = self.api_get(f"read/page/{self._encode_path(self.site_name, asset_path)}")
        if not data or not data.get("success"):
            self.stats["errors"] += 1
            return
        page = data.get("asset", {}).get("page", {})
        xhtml = page.get("xhtml", "")
        if not xhtml:
            structured = page.get("structuredData")
            if structured:
                xhtml = json.dumps(structured, indent=2)
        local_name = asset_path
        if not local_name.endswith(".html") and not local_name.endswith(".htm"):
            local_name = asset_path + ".html" if asset_path else "index.html"
        local_path = os.path.join(self.output_dir, local_name)
        self.write_file(local_path, xhtml or "<!-- empty page -->")
        self.stats["pages"] += 1

    def download_file(self, asset_path):
        data = self.api_get(f"read/file/{self._encode_path(self.site_name, asset_path)}")
        if not data or not data.get("success"):
            self.stats["errors"] += 1
            return
        file_asset = data.get("asset", {}).get("file", {})
        file_data = file_asset.get("data")
        text = file_asset.get("text")
        local_path = os.path.join(self.output_dir, asset_path)
        if file_data is not None:
            if isinstance(file_data, str):
                content = base64.b64decode(file_data)
            elif isinstance(file_data, list):
                content = bytes(b & 0xFF for b in file_data)
            else:
                content = file_data if isinstance(file_data, bytes) else str(file_data).encode()
            self.write_file(local_path, content, binary=True)
        elif text is not None:
            self.write_file(local_path, text)
        else:
            print(f"  WARN: No content for file {asset_path}", file=sys.stderr)
            self.stats["errors"] += 1
            return
        self.stats["files"] += 1

    def download_format(self, asset_path):
        data = self.api_get(f"read/format/{self._encode_path(self.site_name, asset_path)}")
        if not data or not data.get("success"):
            self.stats["errors"] += 1
            return
        asset = data.get("asset", {})
        fmt = asset.get("xsltFormat") or asset.get("scriptFormat") or {}
        content = fmt.get("script", "") or fmt.get("xml", "") or ""
        if not content:
            for key in fmt:
                if isinstance(fmt[key], str) and len(fmt[key]) > 10:
                    content = fmt[key]
                    break
        local_name = asset_path
        if not any(local_name.endswith(ext) for ext in (".vm", ".xsl", ".xslt")):
            local_name += ".vm"
        local_path = os.path.join(self.output_dir, local_name)
        self.write_file(local_path, content or "## empty format")
        self.stats["formats"] += 1

    def download_block(self, asset_path):
        data = self.api_get(f"read/block/{self._encode_path(self.site_name, asset_path)}")
        if not data or not data.get("success"):
            self.stats["errors"] += 1
            return
        asset_obj = data.get("asset", {})
        block = (
            asset_obj.get("xhtmlDataDefinitionBlock")
            or asset_obj.get("xmlBlock")
            or asset_obj.get("textBlock")
            or asset_obj.get("feedBlock")
            or asset_obj.get("indexBlock")
            or {}
        )
        content = block.get("xhtml", "") or block.get("xml", "") or block.get("text", "")
        if not content:
            structured = block.get("structuredData")
            if structured:
                content = json.dumps(structured, indent=2)
        ext = ".html" if block.get("xhtml") else ".xml"
        local_name = asset_path if asset_path.endswith(ext) else asset_path + ext
        local_path = os.path.join(self.output_dir, local_name)
        self.write_file(local_path, content or "<!-- empty block -->")
        self.stats["blocks"] += 1

    def download_template(self, asset_path):
        data = self.api_get(f"read/template/{self._encode_path(self.site_name, asset_path)}")
        if not data or not data.get("success"):
            self.stats["errors"] += 1
            return
        template = data.get("asset", {}).get("template", {})
        content = template.get("xml", "") or template.get("text", "")
        local_name = asset_path if asset_path.endswith(".html") else asset_path + ".html"
        local_path = os.path.join(self.output_dir, local_name)
        self.write_file(local_path, content or "<!-- empty template -->")
        self.stats["templates"] += 1

    def download_data_definition(self, asset_path, asset_id=None):
        if asset_id:
            data = self.api_get(f"read/dataDefinition/{asset_id}")
        else:
            data = self.api_get(f"read/dataDefinition/{self._encode_path(self.site_name, asset_path)}")
        if not data or not data.get("success"):
            self.stats["errors"] += 1
            return
        dd = data.get("asset", {}).get("dataDefinition", {})
        content = dd.get("xml", "")
        if not content:
            content = json.dumps(dd, indent=2)
        local_name = asset_path if asset_path.endswith(".xml") else asset_path + ".xml"
        local_path = os.path.join(self.output_dir, "_data-definitions", local_name)
        self.write_file(local_path, content or "<!-- empty data definition -->")
        self.stats["data_definitions"] += 1

    def download_metadata_set(self, asset_path, asset_id=None):
        if asset_id:
            data = self.api_get(f"read/metadataSet/{asset_id}")
        else:
            data = self.api_get(f"read/metadataSet/{self._encode_path(self.site_name, asset_path)}")
        if not data or not data.get("success"):
            self.stats["errors"] += 1
            return
        ms = data.get("asset", {}).get("metadataSet", {})
        content = json.dumps(ms, indent=2)
        local_name = asset_path if asset_path.endswith(".json") else asset_path + ".json"
        local_path = os.path.join(self.output_dir, "_metadata-sets", local_name)
        self.write_file(local_path, content)
        self.stats["metadata_sets"] += 1

    def download_site_assets(self):
        """Download site-level assets (data definitions, metadata sets) that live outside the folder tree."""
        print("\n--- Site-level assets ---")
        found_any = False

        # Try multiple approaches since API support varies by Cascade version

        # Approach 1: Search API
        for asset_type, label, download_fn in [
            ("datadefinition", "data definition", self.download_data_definition),
            ("metadataset", "metadata set", self.download_metadata_set),
        ]:
            print(f"\nSearching for {label}s...")
            search_data = self.api_post("search", {
                "searchInformation": {
                    "searchTerms": "*",
                    "siteId": self.site_id,
                    "searchTypes": [asset_type],
                }
            })
            if search_data and search_data.get("success"):
                hits = search_data.get("searchMatches", [])
                if hits:
                    found_any = True
                    print(f"  Found {len(hits)} {label}(s)")
                    for hit in hits:
                        asset_id = hit.get("id", "")
                        path = hit.get("path", "") or hit.get("name", asset_id)
                        print(f"  {label.upper()}: {path}")
                        time.sleep(self.delay)
                        download_fn(path, asset_id=asset_id)
                else:
                    print(f"  No {label}s found via search")

        # Approach 2: Container reads (works on self-hosted Cascade)
        for container_type, label, download_fn in [
            ("dataDefinitionContainer", "data definition", self.download_data_definition),
            ("metadataSetContainer", "metadata set", self.download_metadata_set),
        ]:
            container_data = self.api_get(f"read/{container_type}/{self._encode_path(self.site_name)}/")
            if container_data and container_data.get("success"):
                container = container_data.get("asset", {}).get(container_type, {})
                children = container.get("children", [])
                if children:
                    found_any = True
                    print(f"\n  Found {len(children)} {label}(s) in container")
                    for child in children:
                        child_path = child.get("path", {}).get("path", "") if isinstance(child.get("path"), dict) else child.get("path", "")
                        child_id = child.get("id", "")
                        if child_path:
                            print(f"  {label.upper()}: {child_path}")
                            time.sleep(self.delay)
                            download_fn(child_path, asset_id=child_id)

        if not found_any:
            print("\n  NOTE: Data definitions and metadata sets are not accessible via")
            print("  the REST API on Cascade Cloud (services.cascadecms.com).")
            print("  These must be exported manually from the Cascade CMS admin UI.")

    def process_folder(self, folder_path=""):
        display_path = folder_path or "/"
        print(f"\nFOLDER: {display_path}")

        if not folder_path and self.root_folder_id:
            # Read root folder by ID
            endpoint = f"read/folder/{self.root_folder_id}"
        elif folder_path:
            endpoint = f"read/folder/{self._encode_path(self.site_name, folder_path)}"
        else:
            encoded_site = urllib.parse.quote(self.site_name, safe="")
            endpoint = f"read/folder/{encoded_site}/"
        data = self.api_get(endpoint)
        if not data or not data.get("success"):
            msg = data.get("message", "unknown error") if data else "no response"
            print(f"  ERROR: Could not read folder {display_path}: {msg}", file=sys.stderr)
            self.stats["errors"] += 1
            return

        folder = data.get("asset", {}).get("folder", {})
        children = folder.get("children", [])

        if not children:
            print(f"  (empty folder)")
            return

        self.stats["folders"] += 1

        for child in children:
            child_type = child.get("type", "").lower()
            child_path = child.get("path", {}).get("path", "") if isinstance(child.get("path"), dict) else child.get("path", "")

            if not child_path:
                continue

            time.sleep(self.delay)

            if child_type == "folder":
                local_dir = os.path.join(self.output_dir, child_path)
                self.ensure_dir(local_dir)
                self.process_folder(child_path)
            elif child_type == "page":
                print(f"  PAGE: {child_path}")
                self.download_page(child_path)
            elif child_type == "file":
                print(f"  FILE: {child_path}")
                self.download_file(child_path)
            elif child_type in ("format", "format_script", "format_xslt", "script_format", "xslt_format", "scriptformat", "xsltformat"):
                print(f"  FORMAT: {child_path}")
                self.download_format(child_path)
            elif "block" in child_type:
                print(f"  BLOCK: {child_path}")
                self.download_block(child_path)
            elif child_type == "template":
                print(f"  TEMPLATE: {child_path}")
                self.download_template(child_path)
            elif child_type in ("datadefinition", "data_definition"):
                print(f"  DATA DEF: {child_path}")
                self.download_data_definition(child_path)
            elif child_type in ("metadataset", "metadata_set"):
                print(f"  META SET: {child_path}")
                self.download_metadata_set(child_path)
            elif child_type == "reference":
                print(f"  SKIP (reference): {child_path}")
            else:
                print(f"  UNKNOWN TYPE '{child_type}': {child_path}", file=sys.stderr)

    def run(self):
        print(f"Cascade CMS Downloader")
        print(f"  Instance: {self.base_url}")
        print(f"  Site:     {self.site_name}")
        print(f"  Output:   {self.output_dir}")
        print(f"  Force:    {self.force}")
        print()

        # Verify connection by listing sites
        print("Verifying API connection...")
        sites_data = self.api_get("listSites")
        if not sites_data or not sites_data.get("success"):
            print("ERROR: Could not connect to Cascade CMS API. Check your URL and API key.", file=sys.stderr)
            sys.exit(1)

        sites = sites_data.get("sites", [])

        print(f"  API returned {len(sites)} site(s)")

        # Site objects have: id, path.path (site name), path.siteId, type, recycled
        self.site_id = None
        site_names = []
        for s in sites:
            if not isinstance(s, dict):
                continue
            path_obj = s.get("path", {})
            if isinstance(path_obj, dict):
                name = path_obj.get("path", "")
            else:
                name = s.get("name", "")
            sid = s.get("id", "")
            if name:
                site_names.append(name)
            if name == self.site_name:
                self.site_id = sid

        if not self.site_id:
            print(f"WARNING: Site '{self.site_name}' not found.", file=sys.stderr)
            if site_names:
                print(f"  Available sites (first 20): {site_names[:20]}", file=sys.stderr)
            print("Attempting to proceed anyway...", file=sys.stderr)
        else:
            print(f"  Found site '{self.site_name}' (id: {self.site_id})")

        # Read the site object to get the root folder ID and site-level asset IDs
        print("Reading site details...")
        site_data = self.api_get(f"read/site/{self.site_id}")
        if site_data and site_data.get("success"):
            site_obj = site_data.get("asset", {}).get("site", {})
            self.root_folder_id = site_obj.get("rootFolderId", "")
            self.default_metadata_set_id = site_obj.get("defaultMetadataSetId", "")
            self.default_metadata_set_path = site_obj.get("defaultMetadataSetPath", "")
            print(f"  Root folder ID: {self.root_folder_id}")
            if self.default_metadata_set_id:
                print(f"  Default metadata set: {self.default_metadata_set_path} (id: {self.default_metadata_set_id})")
        else:
            self.root_folder_id = None
            self.default_metadata_set_id = None
            self.default_metadata_set_path = None
            msg = site_data.get("message", "") if site_data else ""
            print(f"  Could not read site object: {msg}")

        self.ensure_dir(self.output_dir)
        self.process_folder("")
        self.download_site_assets()

        print(f"\n{'='*50}")
        print(f"Download complete!")
        print(f"  Pages:            {self.stats['pages']}")
        print(f"  Files:            {self.stats['files']}")
        print(f"  Folders:          {self.stats['folders']}")
        print(f"  Formats:          {self.stats['formats']}")
        print(f"  Blocks:           {self.stats['blocks']}")
        print(f"  Templates:        {self.stats['templates']}")
        print(f"  Data Definitions: {self.stats['data_definitions']}")
        print(f"  Metadata Sets:    {self.stats['metadata_sets']}")
        print(f"  Errors:           {self.stats['errors']}")


def main():
    parser = argparse.ArgumentParser(
        description="Download all assets from a Cascade CMS site via the REST API.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s --creds scripts/cascade-creds.json
  %(prog)s --creds scripts/cascade-creds.json --output projects/mysite --force
  %(prog)s --url https://cascade.example.edu --api-key abc123 --site mysite
        """,
    )
    parser.add_argument("--creds", help="Path to JSON creds file with url, api_key, and site fields")
    parser.add_argument("--url", help="Cascade CMS base URL (e.g. https://cascade.example.edu)")
    parser.add_argument("--api-key", default=os.environ.get("CASCADE_API_KEY"), help="API key (or set CASCADE_API_KEY env var)")
    parser.add_argument("--site", help="Site name in Cascade CMS")
    parser.add_argument("--output", default=None, help="Output directory (default: projects/<site-name>)")
    parser.add_argument("--delay", type=float, default=0.1, help="Delay between API requests in seconds (default: 0.1)")
    parser.add_argument("--force", action="store_true", help="Overwrite existing files instead of skipping")

    args = parser.parse_args()

    # Load creds file if provided (CLI args override creds file values)
    if args.creds:
        with open(args.creds, "r") as f:
            creds = json.load(f)
        if not args.url:
            args.url = creds.get("url")
        if not args.api_key:
            args.api_key = creds.get("api_key")
        if not args.site:
            args.site = creds.get("site")

    if not args.url:
        print("ERROR: --url required (or provide via --creds file).", file=sys.stderr)
        sys.exit(1)
    if not args.api_key:
        print("ERROR: API key required. Use --api-key, --creds, or set CASCADE_API_KEY env var.", file=sys.stderr)
        sys.exit(1)
    if not args.site:
        print("ERROR: --site required (or provide via --creds file).", file=sys.stderr)
        sys.exit(1)

    output_dir = args.output or os.path.join("projects", args.site)

    downloader = CascadeDownloader(
        base_url=args.url,
        api_key=args.api_key,
        site_name=args.site,
        output_dir=output_dir,
        delay=args.delay,
        force=args.force,
    )
    downloader.run()


if __name__ == "__main__":
    main()
