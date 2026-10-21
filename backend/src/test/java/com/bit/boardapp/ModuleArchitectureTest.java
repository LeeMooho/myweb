package com.bit.boardapp;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

/** Guards feature boundaries as new modules are added, without a runtime framework. */
class ModuleArchitectureTest {
    private final Path sources = Path.of("src/main/java/com/bit/boardapp");

    private List<Path> javaFiles(Path directory) throws IOException {
        assertThat(directory).isDirectory();
        try (var paths = Files.walk(directory)) {
            return paths.filter(path -> path.toString().endsWith(".java")).toList();
        }
    }

    @Test
    void sharedCodeDoesNotImportFeatureImplementations() throws IOException {
        for (Path file : javaFiles(sources.resolve("shared"))) {
            assertThat(Files.readString(file)).as(file.toString())
                    .doesNotContain("import com.bit.boardapp.board.", "import com.bit.boardapp.user.");
        }
    }

    @ParameterizedTest
    @ValueSource(strings = {"board", "user"})
    void featuresDoNotReachIntoEachOthersInternals(String feature) throws IOException {
        String other = feature.equals("board") ? "user" : "board";
        for (Path file : javaFiles(sources.resolve(feature))) {
            assertThat(Files.readString(file)).as(file.toString())
                    .doesNotContain("import com.bit.boardapp." + other + ".");
        }
    }

    @Test
    void domainModelsDoNotDependOnTransportDtosOrPersistenceAdapters() throws IOException {
        for (String feature : List.of("board", "user")) {
            for (Path file : javaFiles(sources.resolve(feature).resolve("domain"))) {
                assertThat(Files.readString(file)).as(file.toString())
                        .doesNotContain("import com.bit.boardapp." + feature + ".application.",
                                "import com.bit.boardapp." + feature + ".api.",
                                "import com.bit.boardapp." + feature + ".persistence.", "io.minio.");
            }
        }
    }
}
