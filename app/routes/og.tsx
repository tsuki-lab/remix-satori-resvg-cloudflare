import { LoaderFunctionArgs } from "@remix-run/cloudflare";
import { loadGoogleFont } from "~/utils/font";

import satori, { init } from "satori/wasm";
import initYoga from "yoga-wasm-web";
import { Resvg, initWasm } from "@resvg/resvg-wasm";

// /vender wasm
import yogaWasm from "../../vender/yoga.wasm";
import resvgWasm from "../../vender/resvg.wasm";

const initSatori = async () => {
  try {
    init(await initYoga(yogaWasm));
  } catch (error) {
    console.error("[initSatori]", error);
  }
};

const initResvg = async () => {
  try {
    await initWasm(resvgWasm);
  } catch (error) {
    console.error("[initResvg]", error); // NOTE: TypeError: Invalid URL string.
  }
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // initialize wasm
  await Promise.all([initSatori(), initResvg()]);

  const searchParams = new URLSearchParams(request.url);
  const text = searchParams.get("text") ?? "Hello World";

  const notoSans = await loadGoogleFont({
    family: "Noto Sans JP",
    weight: 100,
  });

  const ogpNode = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "50px 100px",
      }}
    >
      {text}
    </div>
  );

  const svg = await satori(ogpNode, {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: "NotoSansJP",
        data: notoSans,
        weight: 100,
        style: "normal",
      },
    ],
  });

  const png = new Resvg(svg).render().asPng();

  return new Response(png, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "max-age=604800",
    },
  });
};
