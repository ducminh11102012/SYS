// swift-tools-version: 5.10
import PackageDescription

let package = Package(
    name: "SYSDashboard",
    platforms: [.macOS(.v13)],
    products: [
        .executable(name: "SYSDashboard", targets: ["SYSDashboard"])
    ],
    targets: [
        .executableTarget(
            name: "SYSDashboard",
            path: "SYSDashboard"
        )
    ]
)
