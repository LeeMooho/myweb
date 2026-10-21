package com.bit.boardapp;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.io.IOException;
import java.lang.reflect.Modifier;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.regex.Pattern;

import static org.assertj.core.api.Assertions.assertThat;

/** Guards feature boundaries as new modules are added, without a runtime framework. */
class ModuleArchitectureTest {
    private static final String BASE_PACKAGE = "com.bit.boardapp.";
    // These roots assemble/share features rather than owning a feature's business rules.
    private static final Set<String> COMPOSITION_ROOTS = Set.of("shared", "app");
    private static final Pattern IMPORT = Pattern.compile("(?m)^import\\s+(static\\s+)?([\\w.*]+)\\s*;");
    private final Path sources = Path.of("src/main/java/com/bit/boardapp");

    private List<Path> javaFiles(Path directory) throws IOException {
        try (var paths = Files.walk(directory)) {
            return paths.filter(path -> path.toString().endsWith(".java")).toList();
        }
    }

    private List<String> discoverFeatures(Path root) throws IOException {
        assertThat(root).isDirectory();
        List<String> features = new ArrayList<>();
        try (var directories = Files.list(root)) {
            for (Path directory : directories.filter(Files::isDirectory).sorted().toList()) {
                String name = directory.getFileName().toString();
                if (!COMPOSITION_ROOTS.contains(name) && !javaFiles(directory).isEmpty()) {
                    features.add(name);
                }
            }
        }
        return features;
    }

    private List<String> features() throws IOException {
        List<String> features = discoverFeatures(sources);
        assertThat(features).as("Production feature packages").isNotEmpty();
        return features;
    }

    private List<ImportReference> imports(Path file) throws IOException {
        List<ImportReference> imports = new ArrayList<>();
        var matcher = IMPORT.matcher(Files.readString(file));
        while (matcher.find()) {
            imports.add(new ImportReference(matcher.group(2), matcher.group(1) != null));
        }
        return imports;
    }

    private boolean isPublicApplicationContract(String feature, ImportReference reference) {
        String importedClass = reference.qualifiedName();
        if (reference.isStatic()) {
            importedClass = importedClass.substring(0, importedClass.lastIndexOf('.'));
        } else if (importedClass.endsWith(".*")) {
            // A package wildcard could expose concrete services alongside public contracts.
            return false;
        }
        Class<?> type = loadImportedClass(importedClass);
        if (type == null || !Modifier.isPublic(type.getModifiers())) return false;
        String applicationPackage = BASE_PACKAGE + feature + ".application";
        return (type.isInterface() && type.getPackageName().equals(applicationPackage))
                || type.getPackageName().equals(applicationPackage + ".dto")
                || type.getPackageName().startsWith(applicationPackage + ".dto.");
    }

    private Class<?> loadImportedClass(String name) {
        String candidate = name;
        while (candidate.startsWith(BASE_PACKAGE)) {
            try {
                return Class.forName(candidate, false, getClass().getClassLoader());
            } catch (ClassNotFoundException ignored) {
                // Java imports use dots for public nested types; class loading uses '$'.
                int lastDot = candidate.lastIndexOf('.');
                if (lastDot < BASE_PACKAGE.length()) return null;
                candidate = candidate.substring(0, lastDot) + '$' + candidate.substring(lastDot + 1);
            }
        }
        return null;
    }

    @Test
    void sharedCodeDoesNotImportFeatureImplementations() throws IOException {
        List<String> featureNames = features();
        for (Path file : javaFiles(sources.resolve("shared"))) {
            for (ImportReference reference : imports(file)) {
                for (String feature : featureNames) {
                    assertThat(reference.qualifiedName()).as(file.toString())
                            .doesNotStartWith(BASE_PACKAGE + feature + ".");
                }
            }
        }
    }

    @Test
    void crossFeatureImportsUsePublicApplicationContracts() throws IOException {
        List<String> features = features();
        for (String feature : features) {
            for (Path file : javaFiles(sources.resolve(feature))) {
                for (ImportReference reference : imports(file)) {
                    for (String other : features) {
                        if (!other.equals(feature) && reference.qualifiedName().startsWith(BASE_PACKAGE + other + ".")) {
                            assertThat(isPublicApplicationContract(other, reference))
                                    .as("%s imports %s: use a public application interface or application.dto contract",
                                            file, reference.qualifiedName())
                                    .isTrue();
                        }
                    }
                }
            }
        }
    }

    @Test
    void domainModelsDoNotDependOnTransportDtosOrPersistenceAdapters() throws IOException {
        for (String feature : features()) {
            Path domain = sources.resolve(feature).resolve("domain");
            if (!Files.isDirectory(domain)) continue;
            for (Path file : javaFiles(domain)) {
                for (ImportReference reference : imports(file)) {
                    if (reference.qualifiedName().startsWith(BASE_PACKAGE)) {
                        assertThat(reference.qualifiedName()).as(file.toString())
                                .doesNotContain(".application.", ".api.", ".persistence.");
                    }
                    assertThat(reference.qualifiedName()).as(file.toString()).doesNotStartWith("io.minio.");
                }
            }
        }
    }

    @Test
    void newFeatureDirectoriesAreDiscoveredWithoutRegisteringTheirNames(@TempDir Path root) throws IOException {
        for (String name : List.of("board", "comment", "shared", "app")) {
            Path directory = root.resolve(name).resolve("application");
            Files.createDirectories(directory);
            Files.writeString(directory.resolve("Contract.java"), "// discovery fixture");
        }
        Files.createDirectories(root.resolve("empty-package"));
        assertThat(discoverFeatures(root)).containsExactly("board", "comment");
    }

    @Test
    void publicApplicationInterfacesAndDtosCanBeConsumedByFutureFeatures() {
        for (String contract : List.of("board.application.BoardService", "user.application.UserService",
                "board.application.dto.BoardDTO", "user.application.dto.UserDTO")) {
            String feature = contract.substring(0, contract.indexOf('.'));
            assertThat(isPublicApplicationContract(feature, new ImportReference(BASE_PACKAGE + contract, false)))
                    .as(contract).isTrue();
        }
    }

    @Test
    void domainPersistenceApiAndConcreteApplicationClassesRemainInternal() {
        for (String internal : List.of("board.domain.Board", "board.persistence.BoardRepository",
                "board.api.BoardController", "board.application.BoardMapper", "board.application.BoardServiceImpl",
                "board.application.BoardAttachmentService", "board.application.*", "board.application.dto.*")) {
            assertThat(isPublicApplicationContract("board", new ImportReference(BASE_PACKAGE + internal, false)))
                    .as(internal).isFalse();
        }
    }

    private record ImportReference(String qualifiedName, boolean isStatic) { }
}
